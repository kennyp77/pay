export interface ServiceProps {
  name: string;
  name_long?: string;
  logo_url: string;
  is_another?: boolean;
  install_text?: string;
  install_module?: {
    name: string;
    link: string;
  };
}
