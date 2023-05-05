type AppInfo = {
  src: string,
  img: string,
  icon: string,
  name: string,
  type: AppType,
  sortorder?: number,
};

type AppType = "app" | "clock" | "widget" | "module" | "bootloader" |
	"settings" | "clkinfo" | "RAM" | "launch" | "textinput" | "scheduler" |
	"notify" | "locale";
