/* p4wn, AKA 5k chess - by Douglas Bagnall <douglas@paradise.net.nz>
 *
 * This code is in the public domain, or as close to it as various
 * laws allow. No warranty; no restrictions.
 *
 * lives at http://p4wn.sf.net/
 */

/*Compatibility tricks:
 * backwards for old MSIEs (to 5.5)
 * sideways for seed command-line javascript.*/
var p4_log;
if (this.imports !== undefined &&
    this.printerr !== undefined){//seed or gjs
    p4_log = function(){
        var args = Array.prototype.slice.call(arguments);
        this.printerr(args.join(', '));
    };
}
else if (this.console === undefined){//MSIE
    p4_log = function(){};
}
else {
    p4_log = function(){console.log.apply(console, arguments);};
}

/*MSIE Date.now backport */
if (Date.now === undefined)
    Date.now = function(){return (new Date).getTime();};

/* The pieces are stored as numbers between 2 and 13, inclusive.
 * Empty squares are stored as 0, and off-board squares as 16.
 * There is some bitwise logic to it:
 *  piece & 1 -> colour (white: 0, black: 1)
 *  piece & 2 -> single move piece (including pawn)
 *  if (piece & 2) == 0:
 *     piece & 4  -> row and column moves
 *     piece & 8  -> diagonal moves
 */
var P4_PAWN = 2, P4_ROOK = 4, P4_KNIGHT = 6, P4_BISHOP = 8, P4_QUEEN = 12, P4_KING = 10;
var P4_EDGE = 16;

/* in order, even indices: <nothing>, pawn, rook, knight, bishop, king, queen. Only the
 * even indices are used.*/
var P4_MOVES = [[], [],
                [], [],
                [1,10,-1,-10], [],
                [21,19,12,8,-21,-19,-12,-8], [],
                [11,9,-11,-9], [],
                [1,10,11,9,-1,-10,-11,-9], [],
                [1,10,11,9,-1,-10,-11,-9], []
               ];

/*P4_VALUES defines the relative value of various pieces.
 *
 * It follows the 1,3,3,5,9 pattern you learn as a kid, multiplied by
 * 20 to give sub-pawn resolution to other factors, with bishops given
 * a wee boost over knights.
 */
var P4_VALUES=[0, 0,      //Piece values
               20, 20,    //pawns
               100, 100,  //rooks
               60, 60,    //knights
               61, 61,    //bishops
               8000, 8000,//kings
               180, 180,  //queens
               0];

/* A score greater than P4_WIN indicates a king has been taken. It is
 * less than the value of a king, in case someone finds a way to, say,
 * sacrifice two queens in order to checkmate.
 */
var P4_KING_VALUE = P4_VALUES[10];
var P4_WIN = P4_KING_VALUE >> 1;

/* every move, a winning score decreases by this much */
var P4_WIN_DECAY = 300;
var P4_WIN_NOW = P4_KING_VALUE - 250;

/* P4_{MAX,MIN}_SCORE should be beyond any possible evaluated score */

var P4_MAX_SCORE = 9999;    // extremes of evaluation range
var P4_MIN_SCORE = -P4_MAX_SCORE;

/*initialised in p4_initialise_state */
var P4_CENTRALISING_WEIGHTS;
var P4_BASE_PAWN_WEIGHTS;
var P4_KNIGHT_WEIGHTS;

/*P4_DEBUG turns on debugging features */
var P4_DEBUG = 0;
var P4_INITIAL_BOARD = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 1 1";

/*use javascript typed arrays rather than plain arrays
 * (faster in some browsers, unsupported in others, possibly slower elsewhere) */
var P4_USE_TYPED_ARRAYS = this.Int32Array !== undefined;

var P4_PIECE_LUT = { /*for FEN, PGN interpretation */
    P: 2,
    p: 3,
    R: 4,
    r: 5,
    N: 6,
    n: 7,
    B: 8,
    b: 9,
    K: 10,
    k: 11,
    Q: 12,
    q: 13
};

var P4_ENCODE_LUT = '  PPRRNNBBKKQQ';


function p4_alphabeta_treeclimber(state, count, colour, score, s, e, alpha, beta){
    var move = p4_make_move(state, s, e, P4_QUEEN);
    var i;
    var ncolour = 1 - colour;
    var movelist = p4_parse(state, colour, move.ep, -score);
    var movecount = movelist.length;
    if(count){
        //branch nodes
        var t;
        for(i = 0; i < movecount; i++){
            var mv = movelist[i];
            var mscore = mv[0];
            var ms = mv[1];
            var me = mv[2];
            if (mscore > P4_WIN){ //we won! Don't look further.
                alpha = P4_KING_VALUE;
                break;
            }
            t = -p4_alphabeta_treeclimber(state, count - 1, ncolour, mscore, ms, me,
                                          -beta, -alpha);
            if (t > alpha){
                alpha = t;
            }
            if (alpha >= beta){
                break;
            }
        }
        if (alpha < -P4_WIN_NOW && ! p4_check_check(state, colour)){
            /* Whatever we do, we lose the king.
             * But if it is not check then this is stalemate, and the
             * score doesn't apply.
             */
            alpha = state.stalemate_scores[colour];
        }
        if (alpha < -P4_WIN){
            /*make distant checkmate seem less bad */
            alpha += P4_WIN_DECAY;
        }
    }
    else{
        //leaf nodes
        while(beta > alpha && --movecount != -1){
            if(movelist[movecount][0] > alpha){
                alpha = movelist[movecount][0];
            }
        }
    }
    p4_unmake_move(state, move);
    return alpha;
}


/* p4_prepare() works out weightings for assessing various moves,
 * favouring centralising moves early, for example.
 *
 * It is called before each tree search, not for each parse(), so it
 * is OK for it to be a little bit slow. But that also means it drifts
 * out of sync with the real board state, especially on deep searches.
 */

function p4_prepare(state){
    var i, j, x, y, a;
    var pieces = state.pieces = [[], []];
    /*convert state.moveno half move count to move cycle count */
    var moveno = state.moveno >> 1;
    var board = state.board;

    /* high earliness_weight indicates a low move number. The formula
     * should work above moveno == 50, but this is javascript.
     */
    var earliness_weight = (moveno > 50) ? 0 : parseInt(6 * Math.exp(moveno * -0.07));
    var king_should_hide = moveno < 12;
    var early = moveno < 5;
    /* find the pieces, kings, and weigh material*/
    var kings = [0, 0];
    var material = [0, 0];
    var best_pieces = [0, 0];
    for(i = 20; i  < 100; i++){
        a = board[i];
        var piece = a & 14;
        var colour = a & 1;
        if(piece){
            pieces[colour].push([a, i]);
            if (piece == P4_KING){
                kings[colour] = i;
            }
            else{
                material[colour] += P4_VALUES[piece];
                best_pieces[colour] = Math.max(best_pieces[colour], P4_VALUES[piece]);
            }
        }
    }

    /*does a draw seem likely soon?*/
    var draw_likely = (state.draw_timeout > 90 || state.current_repetitions >= 2);
    if (draw_likely)
        p4_log("draw likely", state.current_repetitions, state.draw_timeout);
    state.values = [[], []];
    var qvalue = P4_VALUES[P4_QUEEN]; /*used as ballast in various ratios*/
    var material_sum = material[0] + material[1] + 2 * qvalue;
    var wmul = 2 * (material[1] + qvalue) / material_sum;
    var bmul = 2 * (material[0] + qvalue) / material_sum;
    var multipliers = [wmul, bmul];
    var emptiness = 4 * P4_QUEEN / material_sum;
    state.stalemate_scores = [parseInt(0.5 + (wmul - 1) * 2 * qvalue),
                              parseInt(0.5 + (bmul - 1) * 2 * qvalue)];
    //p4_log("value multipliers (W, B):", wmul, bmul,
    //       "stalemate scores", state.stalemate_scores);
    for (i = 0; i < P4_VALUES.length; i++){
        var v = P4_VALUES[i];
        if (v < P4_WIN){//i.e., not king
            state.values[0][i] = parseInt(v * wmul + 0.5);
            state.values[1][i] = parseInt(v * bmul + 0.5);
        }
        else {
            state.values[0][i] = v;
            state.values[1][i] = v;
        }
    }
    /*used for pruning quiescence search */
    state.best_pieces = [parseInt(best_pieces[0] * wmul + 0.5),
                         parseInt(best_pieces[1] * bmul + 0.5)];

    var kx = [kings[0] % 10, kings[1] % 10];
    var ky = [parseInt(kings[0] / 10), parseInt(kings[1] / 10)];

    /* find the frontmost pawns in each file */
    var pawn_cols = [[], []];
    for (y = 3; y < 9; y++){
        for (x = 1; x < 9; x++){
            i = y * 10 + x;
            a = board[i];
            if ((a & 14) != P4_PAWN)
                continue;
            if ((a & 1) == 0){
                pawn_cols[0][x] = y;
            }
            else if (pawn_cols[1][x] === undefined){
                pawn_cols[1][x] = y;
            }
        }
    }
    var target_king = (moveno >= 20 || material_sum < 5 * qvalue);
    var weights = state.weights;

    for (y = 2; y < 10; y++){
        for (x = 1; x < 9; x++){
            i = y * 10 + x;
            var early_centre = P4_CENTRALISING_WEIGHTS[i] * earliness_weight;
            var plateau = P4_KNIGHT_WEIGHTS[i];
            for (var c = 0; c < 2; c++){
                var dx = Math.abs(kx[1 - c] - x);
                var dy = Math.abs(ky[1 - c] - y);
                var our_dx = Math.abs(kx[c] - x);
                var our_dy = Math.abs(ky[c] - y);

                var d = Math.max(Math.sqrt(dx * dx + dy * dy), 1) + 1;
                var mul = multipliers[c]; /*(mul < 1) <==> we're winning*/
                var mul3 = mul * mul * mul;
                var at_home = y == 2 + c * 7;
                var pawn_home = y == 3 + c * 5;
                var row4 = y == 5 + c;
                var promotion_row = y == 9 - c * 7;
                var get_out = (early && at_home) * -5;

                var knight = parseInt(early_centre * 0.3) + 2 * plateau + get_out;
                var rook = parseInt(early_centre * 0.3);
                var bishop = parseInt(early_centre * 0.6) + plateau + get_out;
                if (at_home){
                    rook += (x == 4 || x == 5) * (earliness_weight + ! target_king);
                    rook += (x == 1 || x == 8) * (moveno > 10 && moveno < 20) * -3;
                    rook += (x == 2 || x == 7) * (moveno > 10 && moveno < 20) * -1;
                }

                /*Queen wants to stay home early, then jump right in*/
                /*keep kings back on home row for a while*/
                var queen = parseInt(plateau * 0.5 + early_centre * (0.5 - early));
                var king = (king_should_hide && at_home) * 2 * earliness_weight;

                /*empty board means pawn advancement is more urgent*/
                var get_on_with_it = Math.max(emptiness * 2, 1);
                var pawn = get_on_with_it * P4_BASE_PAWN_WEIGHTS[c ? 119 - i : i];
                if (early){
                    /* Early pawn weights are slightly randomised, so each game is different.
                     */
                    if (y >= 4 && y <= 7){
                        var boost = 1 + 3 * (y == 5 || y == 6);
                        pawn += parseInt((boost + p4_random_int(state, 4)) * 0.1 *
                                         early_centre);
                    }
                    if (x == 4 || x == 5){
                        //discourage middle pawns from waiting at home
                        pawn -= 3 * pawn_home;
                        pawn += 3 * row4;
                    }
                }
                /*pawn promotion row is weighted as a queen minus a pawn.*/
                if (promotion_row)
                    pawn += state.values[c][P4_QUEEN] - state.values[c][P4_PAWN];

                /*pawns in front of a castled king should stay there*/
                pawn += 4 * (y == 3 && ky[c] == 2 && Math.abs(our_dx) < 2 &&
                             kx[c] != 5 && x != 4 && x != 5);
                /*passed pawns (having no opposing pawn in front) are encouraged. */
                var cols = pawn_cols[1 - c];
                if (cols[x] == undefined ||
                    (c == 0 && cols[x] < y) ||
                    (c == 1 && cols[x] > y))
                    pawn += 2;

                /* After a while, start going for opposite king. Just
                 * attract pieces into the area so they can mill about in
                 * the area, waiting for an opportunity.
                 *
                 * As prepare is only called at the beginning of each tree
                 * search, the king could wander out of the targetted area
                 * in deep searches. But that's OK. Heuristics are
                 * heuristics.
                 */
                if (target_king){
                    knight += 2 * parseInt(8 * mul / d);
                    rook += 2 * ((dx < 2) + (dy < 2));
                    bishop += 3 * (Math.abs((dx - dy))  < 2);
                    queen += 2 * parseInt(8 / d) + (dx * dy == 0) + (dx - dy == 0);
                    /* The losing king wants to stay in the middle, while
                     the winning king goes in for the kill.*/
                    var king_centre_wt = 8 * emptiness * P4_CENTRALISING_WEIGHTS[i];
                    king += parseInt(150 * emptiness / (mul3 * d) + king_centre_wt * mul3);
                }
                weights[P4_PAWN + c][i] = pawn;
                weights[P4_KNIGHT + c][i] = knight;
                weights[P4_ROOK + c][i] = rook;
                weights[P4_BISHOP + c][i] = bishop;
                weights[P4_QUEEN + c][i] = queen;
                weights[P4_KING + c][i] = king;

                if (draw_likely && mul < 1){
                    /*The winning side wants to avoid draw, so adds jitter to its weights.*/
                    var range = 3 / mul3;
                    for (j = 2 + c; j < 14; j += 2){
                        weights[j][i] += p4_random_int(state, range);
                    }
                }
            }
        }
    }
    state.prepared = true;
}

function p4_maybe_prepare(state){
    if (! state.prepared)
        p4_prepare(state);
}


function p4_parse(state, colour, ep, score) {
    var board = state.board;
    var s, e;    //start and end position
    var E, a;       //E=piece at end place, a= piece moving
    var i, j;
    var other_colour = 1 - colour;
    var dir = (10 - 20 * colour); //dir= 10 for white, -10 for black
    var movelist = [];
    var captures = [];
    var weight;
    var pieces = state.pieces[colour];
    var castle_flags = (state.castles >> (colour * 2)) & 3;
    var values = state.values[other_colour];
    var all_weights = state.weights;
    for (j = pieces.length - 1; j >= 0; j--){
        s = pieces[j][1]; // board position
        a = board[s]; //piece number
        var weight_lut = all_weights[a];
        weight = score - weight_lut[s];
        a &= 14;
        if(a > 2){    //non-pawns
            var moves = P4_MOVES[a];
            if(a & 2){
                for(i = 0; i < 8; i++){
                    e = s + moves[i];
                    E = board[e];
                    if(!E){
                        movelist.push([weight + values[E] + weight_lut[e], s, e]);
                    }
                    else if((E&17)==other_colour){
                        captures.push([weight + values[E] + weight_lut[e] + all_weights[E][e], s, e]);
                    }
                }
                if(a == P4_KING && castle_flags){
                    if((castle_flags & 1) &&
                        (board[s - 1] + board[s - 2] + board[s - 3] == 0) &&
                        p4_check_castling(board, s - 2, other_colour, dir, -1)){//Q side
                        movelist.push([weight + 12, s, s - 2]);     //no analysis, just encouragement
                    }
                    if((castle_flags & 2) && (board[s + 1] + board[s + 2] == 0) &&
                        p4_check_castling(board, s, other_colour, dir, 1)){//K side
                        movelist.push([weight + 13, s, s + 2]);
                    }
                }
            }
            else{//rook, bishop, queen
                var mlen = moves.length;
                for(i=0;i<mlen;){     //goeth thru list of moves
                    var m = moves[i++];
                    e=s;
                    do {
                        e+=m;
                        E=board[e];
                        if(!E){
                            movelist.push([weight + values[E] + weight_lut[e], s, e]);
                        }
                        else if((E&17)==other_colour){
                            captures.push([weight + values[E] + weight_lut[e] + all_weights[E][e], s, e]);
                        }
                    }while(!E);
                }
            }
        }
        else{    //pawns
            e=s+dir;
            if(!board[e]){
                movelist.push([weight + weight_lut[e], s, e]);
                /* s * (120 - s) < 3200 true for outer two rows on either side.*/
                var e2 = e + dir;
                if(s * (120 - s) < 3200 && (!board[e2])){
                    movelist.push([weight + weight_lut[e2], s, e2]);
                }
            }
            /* +/-1 for pawn capturing */
            E = board[--e];
            if(E && (E & 17) == other_colour){
                captures.push([weight + values[E] + weight_lut[e] + all_weights[E][e], s, e]);
            }
            e += 2;
            E = board[e];
            if(E && (E & 17) == other_colour){
                captures.push([weight + values[E] + weight_lut[e] + all_weights[E][e], s, e]);
            }
        }
    }
    if(ep){
        var pawn = P4_PAWN | colour;
        var taken;
        /* Some repetitive calculation here could be hoisted out, but that would
            probably slow things: the common case is no pawns waiting to capture
            enpassant, not 2.
         */
        s = ep - dir - 1;
        if (board[s] == pawn){
            taken = values[P4_PAWN] + all_weights[P4_PAWN | other_colour][ep - dir];
            captures.push([score - weight_lut[s] + weight_lut[ep] + taken, s, ep]);
        }
        s += 2;
        if (board[s] == pawn){
            taken = values[P4_PAWN] + all_weights[P4_PAWN | other_colour][ep - dir];
            captures.push([score - weight_lut[s] + weight_lut[ep] + taken, s, ep]);
        }
    }
    return captures.concat(movelist);
}

/*Explaining the bit tricks used in check_castling and check_check:
 *
 * in binary:    16 8 4 2 1
 *   empty
 *   pawn               1 c
 *   rook             1   c
 *   knight           1 1 c
 *   bishop         1     c
 *   king           1   1 c
 *   queen          1 1   c
 *   wall         1
 *
 * so:
 *
 * piece & (16 | 4 | 2 | 1) is:
 *  2 + c  for kings and pawns
 *  4 + c  for rooks and queens
 *  6 + c  for knights
 *  0 + c  for bishops
 * 16      for walls
 *
 * thus:
 * ((piece & 23) == 4 | colour) separates the rooks and queens out
 * from the rest.
 * ((piece & 27) == 8 | colour) does the same for queens and bishops.
 */

/* check_castling
 *
 * s - "start" location (either king home square, or king destination)
 *     the checks are done left to right.
 * * dir - direction of travel (White: 10, Black: -10)
 * side: -1 means Q side; 1, K side
 */

function p4_check_castling(board, s, colour, dir, side){
    var e;
    var E;
    var m, p;
    var knight = colour + P4_KNIGHT;
    var diag_slider = P4_BISHOP | colour;
    var diag_mask = 27;
    var grid_slider = P4_ROOK | colour;
    var king_pawn = 2 | colour;
    var grid_mask = 23;

    /* go through 3 positions, checking for check in each
     */
    for(p = s; p < s + 3; p++){
        //bishops, rooks, queens
        e = p;
        do{
            e += dir;
            E=board[e];
        } while (! E);
        if((E & grid_mask) == grid_slider)
            return 0;
        e = p;
        var delta = dir - 1;
        do{
            e += delta;
            E=board[e];
        } while (! E);
        if((E & diag_mask) == diag_slider)
            return 0;
        e = p;
        delta += 2;
        do{
            e += delta;
            E=board[e];
        } while (! E);
        if((E & diag_mask) == diag_slider)
            return 0;
        /*knights on row 7. (row 6 is handled below)*/
        if (board[p + dir - 2] == knight ||
            board[p + dir + 2] == knight)
            return 0;
    }

    /* a pawn or king in any of 5 positions on row 7.
     * or a knight on row 6. */
    for(p = s + dir - 1; p < s + dir + 4; p++){
        E = board[p] & grid_mask;
        if(E == king_pawn || board[p + dir] == knight)
            return 0;
    }
    /* scan back row for rooks, queens on the other side.
     * Same side check is impossible, because the castling rook is there
     */
    e = (side < 0) ? s + 2 : s;
    do {
        e -= side;
        E=board[e];
    } while (! E);
    if((E & grid_mask) == grid_slider)
        return 0;

    return 1;
}

function p4_check_check(state, colour){
    var board = state.board;
    /*find the king.  The pieces list updates from the end,
     * so the last-most king is correctly placed.*/
    var pieces = state.pieces[colour];
    var p;
    var i = pieces.length;
    do {
        p = pieces[--i];
    } while (p[0] != (P4_KING | colour));
    var s = p[1];
    var other_colour = 1 - colour;
    var dir = 10 - 20 * colour;
    if (board[s + dir - 1] == (P4_PAWN | other_colour) ||
        board[s + dir + 1] == (P4_PAWN | other_colour))
        return true;
    var knight_moves = P4_MOVES[P4_KNIGHT];
    var king_moves = P4_MOVES[P4_KING];
    var knight = P4_KNIGHT | other_colour;
    var king = P4_KING | other_colour;
    for (i = 0; i < 8; i++){
        if (board[s + knight_moves[i]] == knight ||
            board[s + king_moves[i]] == king)
            return true;
    }
    var diagonal_moves = P4_MOVES[P4_BISHOP];
    var grid_moves = P4_MOVES[P4_ROOK];

    /* diag_mask ignores rook moves of queens,
     * grid_mask ignores the bishop moves*/
    var diag_slider = P4_BISHOP | other_colour;
    var diag_mask = 27;
    var grid_slider = P4_ROOK | other_colour;
    var grid_mask = 23;
    for (i = 0; i < 4; i++){
        var m = diagonal_moves[i];
        var e = s;
        var E;
        do {
            e += m;
            E = board[e];
        } while (!E);
        if((E & diag_mask) == diag_slider)
            return true;

        m = grid_moves[i];
        e = s;
        do {
            e += m;
            E = board[e];
        } while (!E);
        if((E & grid_mask) == grid_slider)
            return true;
    }
    return false;
}

function p4_optimise_piece_list(state){
    var i, p, s, e;
    var movelists = [
        p4_parse(state, 0, 0, 0),
        p4_parse(state, 1, 0, 0)
    ];
    var weights = state.weights;
    var board = state.board;
    for (var colour = 0; colour < 2; colour++){
        var our_values = state.values[colour];
        var pieces = state.pieces[colour];
        var movelist = movelists[colour];
        var threats = movelists[1 - colour];
        /* sparse array to index by score. */
        var scores = [];
        for (i = 0; i < pieces.length; i++){
            p = pieces[i];
            scores[p[1]] = {
                score: 0,
                piece: p[0],
                pos: p[1],
                threatened: 0
            };
        }
        /* Find the best score for each piece by pure static weights,
         * ignoring captures, which have their own path to the top. */
        for(i = movelist.length - 1; i >= 0; i--){
            var mv = movelist[i];
            var score = mv[0];
            s = mv[1];
            e = mv[2];
            if(! board[e]){
                var x = scores[s];
                x.score = Math.max(x.score, score);
            }
        }
        /* moving out of a threat is worth considering, especially
         * if it is a pawn and you are not.*/
        for(i = threats.length - 1; i >= 0; i--){
            var mv = threats[i];
            var x = scores[mv[2]];
            if (x !== undefined){
                var S = board[mv[1]];
                var r = (1 + x.piece > 3 + S < 4) * 0.01;
                if (x.threatened < r)
                    x.threatened = r;
            }
        }
        var pieces2 = [];
        for (i = 20; i < 100; i++){
            p = scores[i];
            if (p !== undefined){
                p.score += p.threatened * our_values[p.piece];
                pieces2.push(p);
            }
        }
        pieces2.sort(function(a, b){return a.score - b.score;});
        for (i = 0; i < pieces2.length; i++){
            p = pieces2[i];
            pieces[i] = [p.piece, p.pos];
        }
    }
}

function p4_findmove(state, level, colour, ep){
    p4_prepare(state);
    p4_optimise_piece_list(state);
    var board = state.board;

    // Changed for espruino compatibility
    if (colour === undefined) {
        colour = state.to_play;
    }
    if (ep === undefined) {
        ep = state.enpassant;
    }
    var movelist = p4_parse(state, colour, ep, 0);
    var alpha = P4_MIN_SCORE;
    var mv, t, i;
    var bs = 0;
    var be = 0;

    if (level <= 0){
        for (i = 0; i < movelist.length; i++){
            mv = movelist[i];
            if(movelist[i][0] > alpha){
                alpha = mv[0];
                bs = mv[1];
                be = mv[2];
            }
        }
        return [bs, be, alpha];
    }

    for(i = 0; i < movelist.length; i++){
        mv = movelist[i];
        var mscore = mv[0];
        var ms = mv[1];
        var me = mv[2];
        if (mscore > P4_WIN){
            p4_log("XXX taking king! it should never come to this");
            alpha = P4_KING_VALUE;
            bs = ms;
            be = me;
            break;
        }
        t = -state.treeclimber(state, level - 1, 1 - colour, mscore, ms, me,
                               P4_MIN_SCORE, -alpha);
        if (t > alpha){
            alpha = t;
            bs = ms;
            be = me;
        }
    }
    if (alpha < -P4_WIN_NOW && ! p4_check_check(state, colour)){
        alpha = state.stalemate_scores[colour];
    }
    return [bs, be, alpha];
}

/*p4_make_move changes the state and returns an object containing
 * everything necesary to undo the change.
 *
 * p4_unmake_move uses the p4_make_move return value to restore the
 * previous state.
 */

function p4_make_move(state, s, e, promotion){
    var board = state.board;
    var S = board[s];
    var E = board[e];
    board[e] = S;
    board[s] = 0;
    var piece = S & 14;
    var moved_colour = S & 1;
    var end_piece = S; /* can differ from S in queening*/
    //now some stuff to handle queening, castling
    var rs = 0, re, rook;
    var ep_taken = 0, ep_position;
    var ep = 0;
    if(piece == P4_PAWN){
        if((60 - e) * (60 - e) > 900){
            /*got to end; replace the pawn on board and in pieces cache.*/
            promotion |= moved_colour;
            board[e] = promotion;
            end_piece = promotion;
        }
        else if (((s ^ e) & 1) && E == 0){
            /*this is a diagonal move, but the end spot is empty, so we surmise enpassant */
            ep_position = e - 10 + 20 * moved_colour;
            ep_taken = board[ep_position];
            board[ep_position] = 0;
        }
        else if ((s - e) * (s - e) == 400){
            /*delta is 20 --> two row jump at start*/
            ep = (s + e) >> 1;
        }
    }
    else if (piece == P4_KING && ((s - e) * (s - e) == 4)){  //castling - move rook too
        rs = s - 4 + (s < e) * 7;
        re = (s + e) >> 1; //avg of s,e=rook's spot
        rook = moved_colour + P4_ROOK;
        board[rs] = 0;
        board[re] = rook;
        //piece_locations.push([rook, re]);
    }

    var old_castle_state = state.castles;
    if (old_castle_state){
        var mask = 0;
        var shift = moved_colour * 2;
        var side = moved_colour * 70;
        var s2 = s - side;
        var e2 = e + side;
        //wipe both our sides if king moves
        if (s2 == 25)
            mask |= 3 << shift;
        //wipe one side on any move from rook points
        else if (s2 == 21)
            mask |= 1 << shift;
        else if (s2 == 28)
            mask |= 2 << shift;
        //or on any move *to* opposition corners
        if (e2 == 91)
            mask |= 4 >> shift;
        else if (e2 == 98)
            mask |= 8 >> shift;
        state.castles &= ~mask;
    }

    var old_pieces = state.pieces.concat();
    var our_pieces = old_pieces[moved_colour];
    var dest = state.pieces[moved_colour] = [];
    for (var i = 0; i < our_pieces.length; i++){
        var x = our_pieces[i];
        var pp = x[0];
        var ps = x[1];
        if (ps != s && ps != rs){
            dest.push(x);
        }
    }
    dest.push([end_piece, e]);
    if (rook)
        dest.push([rook, re]);

    if (E || ep_taken){
        var their_pieces = old_pieces[1 - moved_colour];
        dest = state.pieces[1 - moved_colour] = [];
        var gone = ep_taken ? ep_position : e;
        for (i = 0; i < their_pieces.length; i++){
            var x = their_pieces[i];
            if (x[1] != gone){
                dest.push(x);
            }
        }
    }

    return {
        /*some of these (e.g. rook) could be recalculated during
         * unmake, possibly more cheaply. */
        s: s,
        e: e,
        S: S,
        E: E,
        ep: ep,
        castles: old_castle_state,
        rs: rs,
        re: re,
        rook: rook,
        ep_position: ep_position,
        ep_taken: ep_taken,
        pieces: old_pieces
    };
}

function p4_unmake_move(state, move){
    var board = state.board;
    if (move.ep_position){
        board[move.ep_position] = move.ep_taken;
    }
    board[move.s] = move.S;
    board[move.e] = move.E;
    //move.piece_locations.length--;
    if(move.rs){
        board[move.rs] = move.rook;
        board[move.re] = 0;
        //move.piece_locations.length--;
    }
    state.pieces = move.pieces;
    state.castles = move.castles;
}


function p4_insufficient_material(state){
    var knights = false;
    var bishops = undefined;
    var i;
    var board = state.board;
    for(i = 20; i  < 100; i++){
        var piece = board[i] & 14;
        if(piece == 0 || piece == P4_KING){
            continue;
        }
        if (piece == P4_KNIGHT){
            /* only allow one knight of either colour, never with a bishop */
            if (knights || bishops !== undefined){
                return false;
            }
            knights = true;
        }
        else if (piece == P4_BISHOP){
            /*any number of bishops, but on only one colour square */
            var x = i & 1;
            var y = parseInt(i / 10) & 1;
            var parity = x ^ y;
            if (knights){
                return false;
            }
            else if (bishops === undefined){
                bishops = parity;
            }
            else if (bishops != parity){
                return false;
            }
        }
        else {
             return false;
        }
    }
    return true;
}

/* p4_move(state, s, e, promotion)
 * s, e are start and end positions
 *
 * promotion is the desired pawn promotion if the move gets a pawn to the other
 * end.
 *
 * return value contains bitwise flags
*/

var P4_MOVE_FLAG_OK = 1;
var P4_MOVE_FLAG_CHECK = 2;
var P4_MOVE_FLAG_MATE = 4;
var P4_MOVE_FLAG_CAPTURE = 8;
var P4_MOVE_FLAG_CASTLE_KING = 16;
var P4_MOVE_FLAG_CASTLE_QUEEN = 32;
var P4_MOVE_FLAG_DRAW = 64;

var P4_MOVE_ILLEGAL = 0;
var P4_MOVE_MISSED_MATE = P4_MOVE_FLAG_CHECK | P4_MOVE_FLAG_MATE;
var P4_MOVE_CHECKMATE = P4_MOVE_FLAG_OK | P4_MOVE_FLAG_CHECK | P4_MOVE_FLAG_MATE;
var P4_MOVE_STALEMATE = P4_MOVE_FLAG_OK | P4_MOVE_FLAG_MATE;

function p4_move(state, s, e, promotion){
    var board = state.board;
    var colour = state.to_play;
    var other_colour = 1 - colour;
    if (s != parseInt(s)){
        if (e === undefined){
            var mv = p4_interpret_movestring(state, s);
            s = mv[0];
            e = mv[1];
            if (s == 0)
                return {flags: P4_MOVE_ILLEGAL, ok: false};
            promotion = mv[2];
        }
        else {/*assume two point strings: 'e2', 'e4'*/
            s = p4_destringify_point(s);
            e = p4_destringify_point(e);
        }
    }
    if (promotion === undefined)
        promotion = P4_QUEEN;
    var E=board[e];
    var S=board[s];

    /*See if this move is even slightly legal, disregarding check.
     */
    var i;
    var legal = false;
    p4_maybe_prepare(state);
    var moves = p4_parse(state, colour, state.enpassant, 0);
    for (i = 0; i < moves.length; i++){
        if (e == moves[i][2] && s == moves[i][1]){
            legal = true;
            break;
        }
    }
    if (! legal) {
        return {flags: P4_MOVE_ILLEGAL, ok: false};
    }

    /*Try the move, and see what the response is.*/
    var changes = p4_make_move(state, s, e, promotion);

    /*is it check? */
    if (p4_check_check(state, colour)){
        p4_unmake_move(state, changes);
        p4_log('in check', changes);
        return {flags: P4_MOVE_ILLEGAL, ok: false, string: "in check!"};
    }
    /*The move is known to be legal. We won't be undoing it.*/

    var flags = P4_MOVE_FLAG_OK;

    state.enpassant = changes.ep;
    state.history.push([s, e, promotion]);

    /*draw timeout: 50 moves without pawn move or capture is a draw */
    if (changes.E || changes.ep_position){
        state.draw_timeout = 0;
        flags |= P4_MOVE_FLAG_CAPTURE;
    }
    else if ((S & 14) == P4_PAWN){
        state.draw_timeout = 0;
    }
    else{
        state.draw_timeout++;
    }
    if (changes.rs){
        flags |= (s > e) ? P4_MOVE_FLAG_CASTLE_QUEEN : P4_MOVE_FLAG_CASTLE_KING;
    }
    var shortfen = p4_state2fen(state, true);
    var repetitions = (state.position_counts[shortfen] || 0) + 1;
    state.position_counts[shortfen] = repetitions;
    state.current_repetitions = repetitions;
    if (state.draw_timeout > 100 || repetitions >= 3 ||
        p4_insufficient_material(state)){
        flags |= P4_MOVE_FLAG_DRAW;
    }
    state.moveno++;
    state.to_play = other_colour;

    if (p4_check_check(state, other_colour)){
        flags |= P4_MOVE_FLAG_CHECK;
    }
    /* check for (stale|check)mate, by seeing if there is a move for
     * the other side that doesn't result in check. (In other words,
     * reduce the pseudo-legal-move list down to a legal-move list,
     * and check it isn't empty).
     *
     * We don't need to p4_prepare because other colour pieces can't
     * have moved (just disappeared) since previous call. Also,
     * setting the promotion piece is unnecessary, because all
     * promotions block check equally well.
    */
    var is_mate = true;
    var replies = p4_parse(state, other_colour, changes.ep, 0);
    for (i = 0; i < replies.length; i++){
        var m = replies[i];
        var change2 = p4_make_move(state, m[1], m[2], P4_QUEEN);
        var check = p4_check_check(state, other_colour);
        p4_unmake_move(state, change2);
        if (!check){
            is_mate = false;
            break;
        }
    }
    if (is_mate)
        flags |= P4_MOVE_FLAG_MATE;

    var movestring = p4_move2string(state, s, e, S, promotion, flags, moves);
    p4_log("successful move", s, e, movestring, flags);
    state.prepared = false;
    return {
        flags: flags,
        string: movestring,
        ok: true
    };
}


function p4_move2string(state, s, e, S, promotion, flags, moves){
    var piece = S & 14;
    var src, dest;
    var mv, i;
    var capture = flags & P4_MOVE_FLAG_CAPTURE;

    src = p4_stringify_point(s);
    dest = p4_stringify_point(e);
    if (piece == P4_PAWN){
        if (capture){
            mv = src.charAt(0) + 'x' + dest;
        }
        else
            mv = dest;
        if (e > 90 || e < 30){  //end row, queening
            if (promotion === undefined)
                promotion = P4_QUEEN;
            mv += '=' + P4_ENCODE_LUT.charAt(promotion);
        }
    }
    else if (piece == P4_KING && (s-e) * (s-e) == 4) {
        if (e < s)
            mv = 'O-O-O';
        else
            mv = 'O-O';
    }
    else {
        var row_qualifier = '';
        var col_qualifier = '';
        var pstr = P4_ENCODE_LUT.charAt(S);
        var sx = s % 10;
        var sy = parseInt(s / 10);

        /* find any other pseudo-legal moves that would put the same
         * piece in the same place, for which we'd need
         * disambiguation. */
        var co_landers = [];
        for (i = 0; i < moves.length; i++){
            var m = moves[i];
            if (e == m[2] && s != m[1] && state.board[m[1]] == S){
                co_landers.push(m[1]);
            }
        }
        if (co_landers.length){
            for (i = 0; i < co_landers.length; i++){
                var c = co_landers[i];
                var cx = c % 10;
                var cy = parseInt(c / 10);
                if (cx == sx)/*same column, so qualify by row*/
                    row_qualifier = src.charAt(1);
                if (cy == sy)
                    col_qualifier = src.charAt(0);
            }
            if (row_qualifier == '' && col_qualifier == ''){
                /*no co-landers on the same rank or file, so one or the other will do.
                 * By convention, use the column (a-h) */
                col_qualifier = src.charAt(0);
            }
        }
        mv = pstr + col_qualifier + row_qualifier + (capture ? 'x' : '') + dest;
    }
    if (flags & P4_MOVE_FLAG_CHECK){
        if (flags & P4_MOVE_FLAG_MATE)
            mv += '#';
        else
            mv += '+';
    }
    else if (flags & P4_MOVE_FLAG_MATE)
        mv += ' stalemate';
    return mv;
}


function p4_jump_to_moveno(state, moveno){
    p4_log('jumping to move', moveno);
    if (moveno === undefined || moveno > state.moveno)
        moveno = state.moveno;
    else if (moveno < 0){
        moveno = state.moveno + moveno;
    }
    var state2 = p4_fen2state(state.beginning);
    var i = 0;
    while (state2.moveno < moveno){
        var m = state.history[i++];
        p4_move(state2, m[0], m[1], m[2]);
    }
    /* copy the replayed state across, not all that deeply, but
     * enough to cover, eg, held references to board. */
    var attr, dest;
    for (attr in state2){
        var src = state2[attr];
        if (attr instanceof Array){
            dest = state[attr];
            dest.length = 0;
            for (i = 0; i < src.length; i++){
                dest[i] = src[i];
            }
        }
        else {
            state[attr] = src;
        }
    }
    state.prepared = false;
}


/* write a standard FEN notation
 * http://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
 * */
function p4_state2fen(state, reduced){
    var piece_lut = '  PpRrNnBbKkQq';
    var board = state.board;
    var fen = '';
    //fen does Y axis backwards, X axis forwards */
    for (var y = 9; y > 1; y--){
        var count = 0;
        for (var x = 1; x < 9; x++){
            var piece = board[y * 10 + x];
            if (piece == 0)
                count++;
            else{
                if (count)
                    fen += count.toString();
                fen += piece_lut.charAt(piece);
                count = 0;
            }
        }
        if (count)
            fen += count;
        if (y > 2)
            fen += '/';
    }
    /*white or black */
    fen += ' ' + 'wb'.charAt(state.to_play) + ' ';
    /*castling */
    if (state.castles){
        var lut = [2, 'K', 1, 'Q', 8, 'k', 4, 'q'];
        for (var i = 0; i < 8; i += 2){
            if (state.castles & lut[i]){
                fen += lut[i + 1];
            }
        }
    }
    else
        fen += '-';
    /*enpassant */
    if (state.enpassant !== 0){
        fen += ' ' + p4_stringify_point(state.enpassant);
    }
    else
        fen += ' -';
    if (reduced){
        /*if the 'reduced' flag is set, the move number and draw
         *timeout are not added. This form is used to detect draws by
         *3-fold repetition.*/
        return fen;
    }
    fen += ' ' + state.draw_timeout + ' ';
    fen += (state.moveno >> 1) + 1;
    return fen;
}

function p4_stringify_point(p){
    var letters = " abcdefgh";
    var x = p % 10;
    var y = (p - x) / 10 - 1;
    return letters.charAt(x) + y;
}

function p4_destringify_point(p){
    var x = parseInt(p.charAt(0), 19) - 9; //a-h <-> 10-18, base 19
    var y = parseInt(p.charAt(1)) + 1;
    if (y >= 2 && y < 10 && x >= 1 && x < 9)
        return y * 10 + x;
    return undefined;
}

/* read a standard FEN notation
 * http://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
 * */
function p4_fen2state(fen, state){
    if (state === undefined)
        state = p4_initialise_state();
    var board = state.board;
    var fenbits = fen.split(' ');
    var fen_board = fenbits[0];
    var fen_toplay = fenbits[1];
    var fen_castles = fenbits[2];
    var fen_enpassant = fenbits[3];
    var fen_timeout = fenbits[4];
    var fen_moveno = fenbits[5];
    if (fen_timeout === undefined)
        fen_timeout = 0;
    //fen does Y axis backwards, X axis forwards */
    var y = 90;
    var x = 1;
    var i, c;
    for (var j = 0; j < fen_board.length; j++){
        c = fen_board.charAt(j);
        if (c == '/'){
            x = 1;
            y -= 10;
            if (y < 20)
                break;
            continue;
        }
        var piece = P4_PIECE_LUT[c];
        if (piece && x < 9){
            board[y + x] = piece;
            x++;
        }
        else {
            var end = Math.min(x + parseInt(c), 9);
            for (; x < end; x++){
                board[y + x] = 0;
            }
        }
    }
    state.to_play = (fen_toplay.toLowerCase() == 'b') ? 1 : 0;
    state.castles = 0;
    /* Sometimes we meet bad FEN that says it can castle when it can't. */
    var wk = board[25] == P4_KING;
    var bk = board[95] == P4_KING + 1;
    var castle_lut = {
        k: 8 * (bk && board[98] == P4_ROOK + 1),
        q: 4 * (bk && board[91] == P4_ROOK + 1),
        K: 2 * (wk && board[28] == P4_ROOK),
        Q: 1 * (wk && board[21] == P4_ROOK)
    };
    for (i = 0; i < fen_castles.length; i++){
        c = fen_castles.charAt(i);
        var castle = castle_lut[c];
        if (castle !== undefined){
            state.castles |= castle;
            if (castle == 0){
                console.log("FEN claims castle state " + fen_castles +
                            " but pieces are not in place for " + c);
            }
        }
    }

    state.enpassant = (fen_enpassant != '-') ? p4_destringify_point(fen_enpassant) : 0;
    state.draw_timeout = parseInt(fen_timeout);
    if (fen_moveno === undefined){
        /*have a guess based on entropy and pieces remaining*/
        var pieces = 0;
        var mix = 0;
        var p, q, r;
        for (y = 20; y < 100; y+=10){
            for (x = 1; x < 9; x++){
                p = board[y + x] & 15;
                pieces += (!!p);
                if (x < 8){
                    q = board[y + x + 1];
                    mix += (!q) != (!p);
                }
                if (y < 90){
                    q = board[y + x + 10];
                    mix += (!q) != (!p);
                }
            }
        }
        fen_moveno = Math.max(1, parseInt((32 - pieces) * 1.3 + (4 - fen_castles.length) * 1.5 + ((mix - 16) / 5)));
        //p4_log("pieces", pieces, "mix", mix, "estimate", fen_moveno);
    }
    state.moveno = 2 * (parseInt(fen_moveno) - 1) + state.to_play;
    state.history = [];
    state.beginning = fen;
    state.prepared = false;
    state.position_counts = {};
    /* Wrap external functions as methods. */
    state.move = function(s, e, promotion){
        return p4_move(this, s, e, promotion);
    };
    state.findmove = function(level){
        return p4_findmove(this, level);
    };
    state.jump_to_moveno = function(moveno){
        return p4_jump_to_moveno(this, moveno);
    };
    return state;
}

/*
Weights would all fit within an Int8Array *except* for the last row
for pawns, which is close to the queen value (180, max is 127).

Int8Array seems slightly quicker in Chromium 18, no different in
Firefox 12.

Int16Array is no faster, perhaps slower than Int32Array.

Int32Array is marginally slower than plain arrays with Firefox 12, but
significantly quicker with Chromium.
 */

var P4_ZEROS = [];
function p4_zero_array(){
    if (P4_USE_TYPED_ARRAYS)
        return new Int32Array(120);
    if (P4_ZEROS.length == 0){
        for(var i = 0; i < 120; i++){
            P4_ZEROS[i] = 0;
        }
    }
    return P4_ZEROS.slice();
}

/* p4_initialise_state() creates the board and initialises weight
 * arrays etc.  Some of this is really only needs to be done once.
 */

function p4_initialise_state(){
    var board = p4_zero_array();
    P4_CENTRALISING_WEIGHTS = p4_zero_array();
    P4_BASE_PAWN_WEIGHTS = p4_zero_array();
    P4_KNIGHT_WEIGHTS = p4_zero_array();
    for(var i = 0; i < 120; i++){
        var y = parseInt(i / 10);
        var x = i % 10;
        var dx = Math.abs(x - 4.5);
        var dy = Math.abs(y - 5.5);
        P4_CENTRALISING_WEIGHTS[i] = parseInt(6 - Math.pow((dx * dx + dy * dy) * 1.5, 0.6));
         //knights have a flat topped centre (bishops too, but less so).
        P4_KNIGHT_WEIGHTS[i] = parseInt(((dx < 2) + (dy < 2) * 1.5)
                                        + (dx < 3) + (dy < 3)) - 2;
        P4_BASE_PAWN_WEIGHTS[i] = parseInt('000012347000'.charAt(y));
        if (y > 9 || y < 2 || x < 1 || x > 8)
            board[i] = 16;
    }
    var weights = [];
    for (i = 0; i < 14; i++){
        weights[i] = p4_zero_array();
    }
    var state = {
        board: board,
        weights: weights,
        history: [],
        treeclimber: p4_alphabeta_treeclimber
    };
    p4_random_seed(state, P4_DEBUG ? 1 : Date.now());
    return state;
}

function p4_new_game(){
    return p4_fen2state(P4_INITIAL_BOARD);
}

/*convert an arbitrary movestring into a pair of integers offsets into
 * the board. The string might be in any of these forms:
 *
 *  "d2-d4" "d2d4" "d4" -- moving a pawn
 *
 *  "b1-c3" "b1c3" "Nc3" "N1c3" "Nbc3" "Nb1c3" -- moving a knight
 *
 *  "b1xc3" "b1xc3" "Nxc3" -- moving a knight, also happens to capture.
 *
 *  "O-O" "O-O-O" -- special cases for castling ("e1-c1", etc, also work)
 *
 *  Note that for the "Nc3" (pgn) format, some knowledge of the board
 *  is necessary, so the state parameter is required. If it is
 *  undefined, the other forms will still work.
 */

function p4_interpret_movestring(state, str){
    /* Ignore any irrelevant characters, then tokenise.
     *
     */
    var FAIL = [0, 0];
    var algebraic_re = /^\s*([RNBQK]?[a-h]?[1-8]?)[ :x-]*([a-h][1-8]?)(=[RNBQ])?[!?+#e.p]*\s*$/;
    var castle_re = /^\s*([O0o]-[O0o](-[O0o])?)\s*$/;
    var position_re = /^[a-h][1-8]$/;

    var m = algebraic_re.exec(str);
    if (m == null){
        /*check for castling notation (O-O, O-O-O) */
        m = castle_re.exec(str);
        if (m){
            s = 25 + state.to_play * 70;
            if (m[2])/*queenside*/
                e = s - 2;
            else
                e = s + 2;
        }
        else
            return FAIL;
    }
    var src = m[1];
    var dest = m[2];
    var queen = m[3];
    var s, e, q;
    var moves, i;
    if (src == '' || src == undefined){
        /* a single coordinate pawn move */
        e = p4_destringify_point(dest);
        s = p4_find_source_point(state, e, 'P' + dest.charAt(0));
    }
    else if (/^[RNBQK]/.test(src)){
        /*pgn format*/
        e = p4_destringify_point(dest);
        s = p4_find_source_point(state, e, src);
    }
    else if (position_re.test(src) && position_re.test(dest)){
        s = p4_destringify_point(src);
        e = p4_destringify_point(dest);
    }
    else if (/^[a-h]$/.test(src)){
        e = p4_destringify_point(dest);
        s = p4_find_source_point(state, e, 'P' + src);
    }
    if (s == 0)
        return FAIL;

    if (queen){
        /* the chosen queen piece */
        q = P4_PIECE_LUT[queen.charAt(1)];
    }
    return [s, e, q];
}


function p4_find_source_point(state, e, str){
    var colour = state.to_play;
    var piece = P4_PIECE_LUT[str.charAt(0)];
    piece |= colour;
    var s, i;

    var row, column;
    /* can be specified as Na, Na3, N3, and who knows, N3a? */
    for (i = 1; i < str.length; i++){
        var c = str.charAt(i);
        if (/[a-h]/.test(c)){
            column = str.charCodeAt(i) - 96;
        }
        else if (/[1-8]/.test(c)){
            /*row goes 2 - 9 */
            row = 1 + parseInt(c);
        }
    }
    var possibilities = [];
    p4_prepare(state);
    var moves = p4_parse(state, colour,
                         state.enpassant, 0);
    for (i = 0; i < moves.length; i++){
        var mv = moves[i];
        if (e == mv[2]){
            s = mv[1];
            if (state.board[s] == piece &&
                (column === undefined || column == s % 10) &&
                (row === undefined || row == parseInt(s / 10))
               ){
                   var change = p4_make_move(state, s, e, P4_QUEEN);
                   if (! p4_check_check(state, colour))
                       possibilities.push(s);
                   p4_unmake_move(state, change);
            }
        }
    }
    p4_log("finding", str, "that goes to", e, "got", possibilities);

    if (possibilities.length == 0){
        return 0;
    }
    else if (possibilities.length > 1){
        p4_log("p4_find_source_point seems to have failed",
               state, e, str,
               possibilities);
    }
    return possibilities[0];
}


/*random number generator based on
 * http://burtleburtle.net/bob/rand/smallprng.html
 */
function p4_random_seed(state, seed){
    seed &= 0xffffffff;
    state.rng = (P4_USE_TYPED_ARRAYS) ? new Uint32Array(4) : [];
    state.rng[0] = 0xf1ea5eed;
    state.rng[1] = seed;
    state.rng[2] = seed;
    state.rng[3] = seed;
    for (var i = 0; i < 20; i++)
        p4_random31(state);
}

function p4_random31(state){
    var rng = state.rng;
    var b = rng[1];
    var c = rng[2];
    /* These shifts amount to rotates.
     * Note the three-fold right shift '>>>', meaning an unsigned shift.
     * The 0xffffffff masks are needed to keep javascript to 32bit. (supposing
     * untyped arrays).
     */
    var e = rng[0] - ((b << 27) | (b >>> 5));
    rng[0] = b ^ ((c << 17) | (c >>> 15));
    rng[1] = (c + rng[3]) & 0xffffffff;
    rng[2] = (rng[3] + e) & 0xffffffff;
    rng[3] = (e + rng[0]) & 0xffffffff;
    return rng[3] & 0x7fffffff;
}

function p4_random_int(state, top){
    /* uniform integer in range [0 <= n < top), supposing top < 2 ** 31
     *
     * This method is slightly (probably pointlessly) more accurate
     * than converting to 0-1 float, multiplying and truncating, and
     * considerably more accurate than a simple modulus.
     * Obviously it is a bit slower.
     */
    /* mask becomes one less than the next highest power of 2 */
    var mask = top;
    mask--;
    mask |= mask >>> 1;
    mask |= mask >>> 2;
    mask |= mask >>> 4;
    mask |= mask >>> 8;
    mask |= mask >>> 16;
    var r;
    do{
        r = p4_random31(state) & mask;
    } while (r >= top);
    return r;
}

// Added for espruino
exports.p4_new_game = p4_new_game;
exports.p4_fen2state = p4_fen2state;
exports.p4_state2fen = p4_state2fen;
exports.p4_random_int = p4_random_int;
exports.P4_INITIAL_BOARD = P4_INITIAL_BOARD;
exports.P4_PAWN = P4_PAWN;
exports.P4_ROOK = P4_ROOK;
exports.P4_KNIGHT = P4_KNIGHT;
exports.P4_BISHOP = P4_BISHOP;
exports.P4_QUEEN = P4_QUEEN;
exports.P4_KING = P4_KING;
exports.P4_MOVE_FLAG_OK = P4_MOVE_FLAG_OK;
exports.P4_MOVE_FLAG_CHECK = P4_MOVE_FLAG_CHECK;
exports.P4_MOVE_FLAG_MATE = P4_MOVE_FLAG_MATE;
exports.P4_MOVE_FLAG_CAPTURE = P4_MOVE_FLAG_CAPTURE;
exports.P4_MOVE_FLAG_CASTLE_KING = P4_MOVE_FLAG_CASTLE_KING;
exports.P4_MOVE_FLAG_CASTLE_QUEEN = P4_MOVE_FLAG_CASTLE_QUEEN;
exports.P4_MOVE_FLAG_DRAW = P4_MOVE_FLAG_DRAW;
exports.P4_MOVE_ILLEGAL = P4_MOVE_ILLEGAL;
exports.P4_MOVE_MISSED_MATE = P4_MOVE_MISSED_MATE;
exports.P4_MOVE_CHECKMATE = P4_MOVE_CHECKMATE;
exports.P4_MOVE_STALEMATE = P4_MOVE_STALEMATE;
