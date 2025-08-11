// типы
import type * as Account from "@/types/account";
// основное
import { ref, watch } from "vue";
import { defineStore } from "pinia";

/* -------------------------------------------------------------------------- */
/*                         Хранилище учётных записей                         */
/* -------------------------------------------------------------------------- */

export const useAccountStore = defineStore("account", () => {
  /** Получение учётных записей из localStorage */
  const getAccounts = () => {
    const storedAccounts = localStorage.getItem("accounts");
    return storedAccounts ? JSON.parse(storedAccounts) : [];
  };

  /** Список учётных записей */
  const accounts = ref<Account.Data[]>(getAccounts());
  /** Типы учётных записей */
  const accountTypes: Account.Type[] = [
    { value: "ldap", label: "LDAP" },
    { value: "local", label: "Локальная" },
  ];

  // сохранение в localStorage
  watch(
    accounts,
    () => localStorage.setItem("accounts", JSON.stringify(accounts.value)),
    { deep: true }
  );

  /** Получение "пустой" учётной записи */
  const getDummyAccount = (): Account.Data => ({
    id: Date.now().toString(),
    tags: [],
    login: "",
    type: "ldap",
    password: null,
  });

  /** Редактирование учётной записи */
  const updateAccounts = (data: Account.Data) => {
    if (!data.login || (!data.password && data.type !== "ldap")) return false;

    const index = accounts.value.findIndex((account) => account.id === data.id);

    if (index < 0) accounts.value.push({ ...getDummyAccount(), ...data });
    else accounts.value[index] = { ...accounts.value[index], ...data };

    return true;
  };

  /** Удаление учётных записей */
  const removeAccount = (...ids: Account.Id[]) =>
    (accounts.value = accounts.value.filter(
      (account) => !ids.includes(account.id)
    ));

  return {
    accounts,
    accountTypes,
    getDummyAccount,
    updateAccounts,
    removeAccount,
  };
});
