/* ----------------------------- Учётная запись ----------------------------- */

/** Общие данные учётной записи */
export interface BaseData {
  id: Id;
  login: string;
  tags?: Tag[];
  type: TypeId;
}

/** Локальная учётная запись */
export interface LocalData extends BaseData {
  type: "local";
  password: string;
}

/** Учётная запись LDAP */
export interface LdapData extends BaseData {
  type: "ldap";
  password: null;
}

/** Данные учётной записи */
export type Data = LocalData | LdapData;

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
