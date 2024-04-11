export interface GeoSuggestProps {
  type: string;
  log_id: {
    server_reqid: string;
    pos: number;
    type: string;
    where: {
      name: string;
      source_id: string;
      title: string;
    };
  };
  personalization_info: {
    server_reqid: string;
    pos: number;
    type: string;
    where: {
      name: string;
      source_id: string;
      title: string;
    };
  };
  title: {
    text: string;
    hl: number[][];
  };
  subtitle: {
    text: string;
    hl: [];
  };
  text: string;
  tags: string[];
  action: string;
  uri: string;
  distance: {
    value: number;
    text: string;
  };
}

export interface GeoSuggestListProps {
  status: string;
  code: number;
  data: GeoSuggestProps[];
}
