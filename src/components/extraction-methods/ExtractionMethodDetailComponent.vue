<template>
  <q-card
    v-if="method"
    flat
    bordered
    class="method-detail"
  >
    <q-card-section class="row items-center">
      <div>
        <div class="text-h6">
          {{ method.code }} · {{ method.name }}
        </div>
        <div class="km-muted">
          {{ method.description || t('common.notAvailable') }}
        </div>
      </div>
      <q-space />
      <q-badge
        :color="method.isActive ? 'positive' : 'grey-7'"
        :label="t(method.isActive ? 'common.active' : 'common.inactive')"
      />
    </q-card-section>
    <q-separator />

    <q-card-section>
      <div class="detail-grid">
        <div><span>{{ t('extractionMethods.fields.protocol') }}</span><strong>{{ method.protocol }}</strong></div>
        <div><span>{{ t('extractionMethods.fields.createdAt') }}</span><strong>{{ formatDate(method.createdAt) }}</strong></div>
        <div><span>{{ t('extractionMethods.fields.updatedAt') }}</span><strong>{{ formatDate(method.updatedAt) }}</strong></div>
      </div>
    </q-card-section>

    <template v-if="method.configurationSchema">
      <q-separator />
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">
          {{ t('extractionMethods.sections.configurationSchema') }}
        </div>
        <pre class="json-view">{{ formatJson(method.configurationSchema) }}</pre>
      </q-card-section>
    </template>

    <q-separator />
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-sm">
        {{ t('extractionMethods.sections.parameters') }}
      </div>
      <q-markup-table
        flat
        dense
        separator="horizontal"
      >
        <thead>
          <tr>
            <th class="text-left">
              {{ t('extractionMethods.fields.parameterKey') }}
            </th>
            <th class="text-left">
              {{ t('extractionMethods.fields.dataType') }}
            </th>
            <th class="text-left">
              {{ t('extractionMethods.fields.defaultValue') }}
            </th>
            <th class="text-center">
              {{ t('extractionMethods.fields.required') }}
            </th>
            <th class="text-center">
              {{ t('extractionMethods.fields.secret') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="parameter in method.parameters"
            :key="parameter.id"
          >
            <td>{{ parameter.parameterKey }}</td>
            <td>{{ parameter.dataType }}</td>
            <td>{{ parameter.isSecret ? t('extractionMethods.fields.hiddenSecret') : parameter.defaultValue || t('common.notAvailable') }}</td>
            <td class="text-center">
              {{ t(parameter.isRequired ? 'common.yes' : 'common.no') }}
            </td>
            <td class="text-center">
              {{ t(parameter.isSecret ? 'common.yes' : 'common.no') }}
            </td>
          </tr>
          <tr v-if="method.parameters.length === 0">
            <td
              colspan="5"
              class="km-muted"
            >
              {{ t('extractionMethods.emptyParameters') }}
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card-section>

    <q-separator />
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-sm">
        {{ t('extractionMethods.sections.requests') }}
      </div>
      <q-expansion-item
        v-for="request in method.requests"
        :key="request.id"
        :label="`${request.code} · ${request.name}`"
        :caption="request.requestType"
        expand-separator
      >
        <div class="q-pa-md">
          <div class="request-config">
            {{ formatJson(request.requestConfig) }}
          </div>
          <q-markup-table
            flat
            dense
            separator="horizontal"
            class="q-mt-sm"
          >
            <thead>
              <tr>
                <th class="text-left">
                  {{ t('extractionMethods.fields.fieldKey') }}
                </th>
                <th class="text-left">
                  {{ t('extractionMethods.fields.sourcePath') }}
                </th>
                <th class="text-left">
                  {{ t('extractionMethods.fields.dataType') }}
                </th>
                <th class="text-left">
                  {{ t('extractionMethods.fields.unit') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="field in request.fields"
                :key="field.id"
              >
                <td>{{ field.fieldKey }}</td><td>{{ field.sourcePath }}</td><td>{{ field.dataType }}</td><td>{{ field.unit || t('common.notAvailable') }}</td>
              </tr>
              <tr v-if="request.fields.length === 0">
                <td
                  colspan="4"
                  class="km-muted"
                >
                  {{ t('extractionMethods.emptyFields') }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </q-expansion-item>
      <div
        v-if="method.requests.length === 0"
        class="km-muted"
      >
        {{ t('extractionMethods.emptyRequests') }}
      </div>
    </q-card-section>

    <template v-if="method.versions.length">
      <q-separator />
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">
          {{ t('extractionMethods.sections.versions') }}
        </div>
        <q-list
          dense
          separator
        >
          <q-item
            v-for="version in method.versions"
            :key="version.id"
          >
            <q-item-section>{{ t('extractionMethods.versionLabel', { version: version.versionNumber }) }}</q-item-section>
            <q-item-section side>
              {{ formatDate(version.createdAt) }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </template>

    <q-separator />
    <q-card-section>
      <ExtractionMethodEquipmentBindingsComponent :method-id="method.id" />
    </q-card-section>
  </q-card>
  <q-card
    v-else
    flat
    bordered
    class="method-detail empty-detail row items-center justify-center"
  >
    <div class="km-muted">
      {{ t('extractionMethods.selectPrompt') }}
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ExtractionMethod } from 'src/models/extraction-method';
import ExtractionMethodEquipmentBindingsComponent from './ExtractionMethodEquipmentBindingsComponent.vue';

defineProps<{ method: ExtractionMethod | null }>();
const { t, d } = useI18n();

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : d(date, 'short');
}

function formatJson(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2);
}
</script>

<style scoped>
.method-detail {
  min-width: 0;
}

.empty-detail {
  min-height: 320px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.detail-grid > div {
  display: grid;
  gap: 4px;
}

.detail-grid span {
  color: var(--km-muted);
  font-size: 12px;
}

.detail-grid strong {
  overflow-wrap: anywhere;
}

.json-view,
.request-config {
  margin: 0;
  padding: 12px;
  overflow: auto;
  border-radius: 4px;
  background: var(--km-background);
  color: var(--km-text);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 700px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>