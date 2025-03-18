type AppInfo = {
  id: string,
  src?: string,
  img?: string,
  icon?: string,
  name: string,
  type?: AppType,
  version?: string,
  tags?: string,
  files: string,
  data?: string,
  sortorder?: number,
};

type AppType = "app" | "clock" | "widget" | "module" | "bootloader" |
  "settings" | "clkinfo" | "RAM" | "launch" | "textinput" | "scheduler" |
  "notify" | "locale" | "defaultconfig";
