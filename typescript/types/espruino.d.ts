/*~ This file declares the Espruino utility class.
 *~ Reference: https://banglejs.com/reference#E
 */

declare const E: {
  showAlert: (() => Promise<undefined>) &
    ((message: string, title?: string) => Promise<number>);
  showMenu: (() => undefined) &
    ((menu: {
      // The "" value includes menu options.
      ""?: {
        title?: string;
        back?: () => void;
        selected?: number;
        fontHeight?: number;
        x?: number;
        y?: number;
        x2?: number;
        y2?: number;
        cB?: number;
        cF?: number;
        cHB?: number;
        cHF?: number;
        predraw?: (gfx: GraphicsApi) => void;
        preflip?: (gfx: GraphicsApi, less: boolean, more: boolean) => void;
      } & {
        // All the other key-value pairs are menu items.
        [key: string]:
          | undefined
          | (() => void)
          | {
              value: boolean;
              format?: (value: boolean) => string;
              onchange?: (value: boolean) => void;
            }
          | {
              value: number;
              min?: number;
              max?: number;
              step?: number;
              format?: (value: number) => string;
              onchange?: (value: number) => void;
            };
      };
    }) => {
      draw: () => void;
      move: () => void;
      select: () => void;
    });
  showPrompt: (() => Promise<undefined>) &
    (<T extends any = boolean>(
      message: string,
      options?: {
        title?: string;
        buttons?: { [key: string]: T };
        img?: string;
      }
    ) => Promise<T>);
};
