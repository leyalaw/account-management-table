/* ----------------------------- Учётная запись ----------------------------- */

/** Данные учётной записи */
export interface Data {
  id: Id;
  login: string;
  tags?: Tag[];
  type: TypeId;
  password: string | null;
}

/** Идентификатор учётной записи */
export type Id = string;

/** Метка учётной записи */
export type Tag = { text: string };

/* --------------------------- Тип учётной записи --------------------------- */

/** Тип учётной записи */
export interface Type {
  value: TypeId;
  label: string;
}

/** Идентификатор типа учётной записи */
export type TypeId = "local" | "ldap";
