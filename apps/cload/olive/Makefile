all: t3d_sdl t_sdl

t3d_sdl:
	gcc -DVC_PLATFORM=VC_SDL_PLATFORM triangle3d.c -lSDL2 -lm -I . -o t3d_sdl

t_sdl:
	gcc -DVC_PLATFORM=VC_SDL_PLATFORM triangle.c -lSDL2 -lm -I . -o t_sdl

t3d_test:
	gcc -DVC_PLATFORM=VC_ESPRUINO_PLATFORM triangle3d.c -lm -I . -o t3d_test
