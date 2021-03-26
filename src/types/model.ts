export interface ModelDatesResponse {
  created_at: string | Date | null;
  updated_at: string | Date | null;
}

export interface ModelBaseResponse extends ModelDatesResponse {
  id: string;
}

export interface ModelBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}
