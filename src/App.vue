<template>
  <Alert :visible="isAlertVisible" :message="alertMessage" :type="alertType" />

  <main class="m-4">
    <header class="mb-4">
      <h1>Управление учётными записями</h1>
    </header>
    <AccountManagementTable @change="onAccountChange" />
  </main>
</template>

<script setup lang="ts">
import AccountManagementTable from "@components/AccountManagementTable.vue";
import Alert from "./components/Alert.vue";
import { ref } from "vue";

const ALERT_TIMEOUT: number = 1000;
const isAlertVisible = ref<boolean>(false);
const alertMessage = ref<string>("");
const alertType = ref<string>("");

const onAccountChange = () => showAlert("Учётная запись изменена", "success");

const showAlert = (message: string, type: string) => {
  alertMessage.value = message;
  alertType.value = type;
  isAlertVisible.value = true;
  setTimeout(() => (isAlertVisible.value = false), ALERT_TIMEOUT);
};
</script>

<style scoped></style>
