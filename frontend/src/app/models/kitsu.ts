interface MappingResponse {
  data: MappingData[];
  meta: { count: number };
  links: {
    first: string;
    last: string;
  };
}

interface MappingData {
  id: string;
  type: 'mappings';
  links: { self: string };
  attributes: {
    externalSite: string;
    externalId: string;
  };
  relationships: {
    item: {
      links: {
        self: string;
        related: string;
      };
    };
  };
}

export type KitsuMappingResponse = MappingResponse;
