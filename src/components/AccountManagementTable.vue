<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <!-- ШАПКА -->
      <thead>
        <tr>
          <th :colspan="COLUMNS.length" class="text-end">
            <!-- кнопка добавления учётной записи -->
            <button @click="createAccount" class="btn btn-primary px-5">
              {{ TEXT.createAccount }}
            </button>
          </th>
        </tr>
        <tr>
          <th
            v-for="(column, index) in COLUMNS"
            :key="column.name"
            scope="col"
            :class="[`col-${column.col}`, { 'text-end': isLastColumn(index) }]"
          >
            <!-- чекбокс выбора всех учётных записей -->
            <span v-if="column.name === 'checkbox'">
              <input
                type="checkbox"
                v-model="selectAll"
                :aria-label="TEXT.selectAll"
                :disabled="accountsAmount === 0"
                @change="toggleSelectAll"
              />
            </span>
            <!-- кнопка удаления выбранных учётных записей -->
            <span v-else-if="column.name === 'delete'">
              <button
                v-if="selectedAccounts.length > 0"
                :aria-label="TEXT.deleteSelected"
                @click="
                  confirm(TEXT.confirmDeleteSelected, deleteSelectedAccounts)
                "
                class="btn btn-danger btn-sm"
              >
                {{ column.label }}
              </button>
            </span>
            <!-- названия колонок -->
            <span v-else>
              {{ column.label }}
              <!-- всплывающая подсказка для колонки меток -->
              <i
                v-if="column.name === 'tags'"
                class="bi bi-question-circle"
                v-tooltip.persistent="TEXT.tagsTooptip"
              ></i
            ></span>
          </th>
        </tr>
      </thead>
      <!-- ТЕЛО -->
      <tbody v-if="accountsAmount > 0">
        <tr v-for="accountData in accountTableData" :key="accountData.id">
          <td
            v-for="(column, index) in COLUMNS"
            :key="column.name"
            :class="{ 'text-end': isLastColumn(index) }"
          >
            <!-- чекбокс для выбора учётной записи -->
            <input
              v-if="column.name === 'checkbox'"
              type="checkbox"
              v-model="selectedAccounts"
              :value="accountData.id"
            />
            <!-- поле для ввода меток -->
            <textarea
              v-else-if="column.name === 'tags'"
              v-model="accountData.tags"
              v-tooltip="errors[accountData.id]?.tags"
              rows="1"
              :placeholder="TEXT.placeholder"
              @blur="prepareField(accountData.id, 'tags')"
              @input="clearError(accountData.id, 'tags')"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors[accountData.id]?.tags }"
            ></textarea>
            <!-- выбор типа учётной записи -->
            <select
              v-else-if="column.name === 'type'"
              v-model="accountData.type"
              @change="prepareField(accountData.id, 'type')"
              class="form-select form-select-sm"
            >
              <option
                v-for="type in store.accountTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
            <!-- поле для ввода логина -->
            <input
              v-else-if="column.name === 'login'"
              type="text"
              maxlength="100"
              v-model="accountData.login"
              v-tooltip="errors[accountData.id]?.login"
              :placeholder="TEXT.placeholder"
              @blur="prepareField(accountData.id, 'login')"
              @input="clearError(accountData.id, 'login')"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors[accountData.id]?.login }"
            />
            <!-- поле для ввода пароля -->
            <input
              v-else-if="
                column.name === 'password' && accountData.type === 'local'
              "
              type="password"
              v-model="accountData.password"
              v-tooltip="errors[accountData.id]?.password"
              :placeholder="TEXT.placeholder"
              @blur="prepareField(accountData.id, 'password')"
              @input="clearError(accountData.id, 'password')"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors[accountData.id]?.password }"
            />
            <!-- кнопка удаления учётной записи -->
            <button
              v-else-if="column.name === 'delete'"
              @click="
                confirm(TEXT.confirmDelete, deleteAccount, accountData.id)
              "
              class="btn btn-danger"
            >
              <i class="bi bi-trash3"></i>
            </button>
          </td>
        </tr>
      </tbody>
      <!-- ПУСТОЕ ТЕЛО -->
      <tbody v-else>
        <tr>
          <td :colspan="COLUMNS.length" class="text-center">
            <span>{{ TEXT.empty }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ -->
    <div
      class="modal fade"
      tabindex="-1"
      aria-hidden="true"
      ref="confirmModalRef"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">{{ TEXT.confirmModalHeader }}</h2>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              :aria-label="TEXT.confirmModalClose"
            ></button>
          </div>
          <div class="modal-body">
            {{ confirmData.message }}
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-danger"
              data-bs-dismiss="modal"
              @click="confirmData.handler()"
            >
              {{ TEXT.confirmModalAgree }}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              {{ TEXT.confirmModalDisagree }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* -------------------------------------------------------------------------- */
/*                    Таблица управления учётными записями                    */
/* -------------------------------------------------------------------------- */

// типы
import type * as Account from "@/types/account";
// основное
import { computed, onMounted, ref } from "vue";
import { Modal } from "bootstrap";
// хранилище
import { useAccountStore } from "@store/account";

/* ---------------------------------- Типы ---------------------------------- */

/** Данные столбца */
interface ColumnData {
  name: keyof Account.Data | "checkbox" | "delete";
  col: number;
  label?: string;
}

/** Данные для подтверждения */
interface ConfirmData {
  id?: Account.Id | Account.Id[];
  message: string;
  handler: () => void;
  data?: Partial<Account.Data>;
}

/** Неотформатированные данные учётной записи */
type AccountRawData = Omit<Account.Data, "tags"> & { tags: string };

/* -------------------------------------------------------------------------- */

// текст помещен в объект для удобства редактирования
/** Текст */
const TEXT: Record<string, string> = {
  empty: "Список пуст",
  placeholder: "Значение",
  createAccount: "Добавить",
  selectAll: "Выбрать все учётные записи",
  deleteSelected: "Удалить выбранные учётные записи",
  tagsTooptip:
    "Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;",
  tagLimit: "Тег не должен превышать 50 символов",
  confirmModalHeader: "Внимание!",
  confirmModalClose: "Закрыть модальное окно",
  confirmModalAgree: "Ок",
  confirmModalDisagree: "Отмена",
  confirmDelete: "Вы действительно хотите удалить учётную запись?",
  confirmDeleteSelected:
    "Вы действительно хотите удалить выбранные учётные записи?",
  confirmLdap:
    "Изменение типа аккаунта приведет к очистке пароля. Вы уверены, что хотите продолжить?",
  confirmTrim:
    "Поле будет сохранено без пробелов в начале и в конце. Продолжить?",
  errorEmpty: "Поле не может быть пустым",
};

/** Данные столбцов */
const COLUMNS: ColumnData[] = [
  { name: "checkbox", col: 1 },
  { name: "tags", col: 2, label: "Метки" },
  { name: "type", col: 2, label: "Тип записи" },
  { name: "login", col: 3, label: "Логин" },
  { name: "password", col: 3, label: "Пароль" },
  { name: "delete", col: 1, label: "Удалить" },
];

const emit = defineEmits(["change"]);

/** Модальное окно */
const confirmModal = ref<Modal | null>(null);
/** Элемент модального окна */
const confirmModalRef = ref<HTMLElement | null>(null);
/** Данные для подтверждения */
const confirmData = ref<ConfirmData>({
  id: "",
  message: "",
  handler: () => {},
  data: undefined,
});

/** Хранилище */
const store = useAccountStore();

/** Ошибки */
const errors = ref<
  Record<Account.Id, Partial<Record<keyof Account.Data, string>>>
>({});

/** Выбранные учётные записи */
const selectedAccounts = ref<Account.Id[]>([]);
/** Флаг выбора всех учётных записей */
const selectAll = ref(false);

/** Объект неотформатированных данных учётных записей */
const accountTableData = ref<Record<Account.Id, AccountRawData>>({});
/** Количество учётных записей */
const accountsAmount = computed(
  () => Object.keys(accountTableData.value).length
);

/* -------------------------------------------------------------------------- */

/** Преобразование меток в строку */
const getTagsString = (tags: Account.Tag[] = []): string =>
  tags.reduce(
    (string, tag) => string + (string.length ? "; " : "") + tag.text,
    ""
  );

/** Проверка, является ли столбец последним */
const isLastColumn = (index: number): boolean => index === COLUMNS.length - 1;

/** Переключение выбора всех учётных записей */
const toggleSelectAll = () => {
  selectedAccounts.value = selectAll.value
    ? Object.keys(accountTableData.value)
    : [];
};

/** Очистка ошибки поля */
const clearError = (id: Account.Id, field: keyof Account.Data) => {
  if (errors.value[id]) delete errors.value[id][field];
};

/** Создание учётной записи */
const createAccount = () => {
  const dummyAccount = store.getDummyAccount();

  accountTableData.value[dummyAccount.id] = { ...dummyAccount, tags: "" };
};

/** Вызов модального окна для подтверждения */
const confirm = (
  message: string,
  handler: () => void,
  id?: Account.Id | Account.Id[],
  data?: Partial<Account.Data>
) => {
  confirmData.value = { id, message, handler, data };
  confirmModal.value?.show();
};

/** Подготовка логина и пароля для обновления */
const prepareInput = (id: Account.Id, field: keyof Account.Data) => {
  const fieldValue = accountTableData.value[id][field];

  if (typeof fieldValue !== "string") {
    changeData(id, { [field]: fieldValue });
    return;
  }

  const trimmedValue = fieldValue.trim();

  if (!trimmedValue.length) {
    if (!errors.value[id]) errors.value[id] = {};

    errors.value[id][field] = TEXT.errorEmpty;
  } else if (trimmedValue.length !== fieldValue.length) {
    confirm(TEXT.confirmTrim, changeData, id, {
      [field]: trimmedValue,
    });
  } else changeData(id, { [field]: trimmedValue });
};

/** Подготовка типа учётной записи для обновления */
const prepareType = (id: Account.Id) => {
  const account = accountTableData.value[id];

  if (account.type === "ldap" && account.password) {
    accountTableData.value[id].type = "local";
    confirm(TEXT.confirmLdap, changeData, id, {
      type: "ldap",
      password: null,
    });
  } else
    changeData(id, {
      type: account.type,
      password: account.type === "ldap" ? null : "",
    });
};

/** Подготовка меток для обновления */
const prepareTags = (id: Account.Id) => {
  const tagValueList = accountTableData.value[id].tags.split(";");
  let tags = [];

  for (const value of tagValueList) {
    const trimmedTag = value.trim();

    if (trimmedTag.length > 50) {
      if (!errors.value[id]) errors.value[id] = {};
      errors.value[id].tags = TEXT.tagLimit;
      return;
    }

    if (trimmedTag.length) tags.push({ text: trimmedTag });
  }

  changeData(id, { tags }, true);
};

/** Удаление учётных записей */
const deleteAccount = (...ids: Account.Id[]) => {
  const accountIds: Account.Id[] = ids.length
    ? ids
    : Array.isArray(confirmData.value.id)
    ? confirmData.value.id
    : [confirmData.value.id || ""];

  store.removeAccount(...accountIds);

  accountIds.forEach((id) => {
    delete accountTableData.value[id];
    delete errors.value[id];
  });
};

/** Удаление выбранных учётных записей */
const deleteSelectedAccounts = () => {
  deleteAccount(...selectedAccounts.value);
  selectedAccounts.value = [];
  selectAll.value = false;
};

/** Обновление данных учётной записи */
const changeData = (
  id?: Account.Id,
  data?: Partial<Account.Data>,
  withTags: boolean = false
) => {
  const accountId = id ?? confirmData.value.id;
  const updateData = data ?? confirmData.value.data;

  if (!accountId || typeof accountId !== "string" || !updateData) return;

  const updatedData: Omit<Account.Data, "tags"> = {
    ...accountTableData.value[accountId],
    ...updateData,
  };

  if (!withTags && "tags" in updatedData) delete updatedData.tags;

  const result = store.updateAccounts(updatedData);

  if (result) emit("change");

  if ("tags" in updatedData)
    updatedData.tags = getTagsString(updatedData.tags as Account.Tag[]);

  accountTableData.value[accountId] = {
    ...accountTableData.value[accountId],
    ...updatedData,
  };
};

/** Распределение обработки полей */
const prepareField = (accountId: Account.Id, field: keyof Account.Data) => {
  switch (field) {
    case "login":
    case "password":
      prepareInput(accountId, field);
      break;
    case "type":
      prepareType(accountId);
      break;
    case "tags":
      prepareTags(accountId);
      break;
  }
};

onMounted(() => {
  if (confirmModalRef.value)
    confirmModal.value = new Modal(confirmModalRef.value);

  store.accounts.forEach((account) => {
    accountTableData.value[account.id] = {
      ...account,
      tags: getTagsString(account.tags),
    };
  });
});
</script>

<style scoped>
table {
  min-width: 768px;
}
</style>
