import { useSession } from './session/sessionService';
import type {
  ExtractionAvailableData,
  ExtractionMethod,
  ExtractionMethodInput,
  ExtractionMethodMutationResult,
  ExtractionMethodProtocol,
  EquipmentExtractionMethod,
  EquipmentExtractionMethodInput,
} from 'src/models/extraction-method';
import {
  createExtractionMethod,
  createEquipmentExtractionMethod,
  deleteEquipmentExtractionMethod,
  deleteExtractionMethod,
  getExtractionMethodAvailableData,
  getExtractionMethodById,
  getExtractionMethodProtocolOptions,
  listExtractionMethods,
  listEquipmentExtractionMethods,
  updateExtractionMethod,
  updateEquipmentExtractionMethod,
} from 'src/repositories/extraction-method.api.repository';

const { activeCompany } = useSession();

export class ExtractionMethodService {
  private ensureCompanyContext(): void {
    if (!activeCompany.value?.code) throw new Error('Active Company context is required.');
  }

  listMethods(): Promise<ExtractionMethod[]> {
    this.ensureCompanyContext();
    return listExtractionMethods();
  }

  getMethod(id: string): Promise<ExtractionMethod | null> {
    this.ensureCompanyContext();
    return getExtractionMethodById(id);
  }

  async createMethod(value: ExtractionMethodInput): Promise<ExtractionMethodMutationResult> {
    const normalized = this.normalize(value);
    if (!normalized.code || !normalized.name || !normalized.protocol) return { success: false, reason: 'required' };
    if (this.hasDuplicateNestedCodes(normalized)) return { success: false, reason: 'duplicate-nested' };
    this.ensureCompanyContext();
    const method = await createExtractionMethod(normalized);
    return method ? { success: true, method } : { success: false, reason: 'duplicate' };
  }

  async updateMethod(id: string, value: ExtractionMethodInput): Promise<ExtractionMethodMutationResult> {
    const normalized = this.normalize(value);
    if (!normalized.code || !normalized.name || !normalized.protocol) return { success: false, reason: 'required' };
    if (this.hasDuplicateNestedCodes(normalized)) return { success: false, reason: 'duplicate-nested' };
    this.ensureCompanyContext();
    const method = await updateExtractionMethod(id, normalized);
    if (method) return { success: true, method };
    return { success: false, reason: await this.getMethod(id) ? 'duplicate' : 'not-found' };
  }

  deleteMethod(id: string): Promise<boolean> {
    this.ensureCompanyContext();
    return deleteExtractionMethod(id);
  }

  listEquipmentBindings(methodId: string): Promise<EquipmentExtractionMethod[]> {
    this.ensureCompanyContext();
    return listEquipmentExtractionMethods(methodId);
  }

  createEquipmentBinding(methodId: string, value: EquipmentExtractionMethodInput): Promise<EquipmentExtractionMethod | null> {
    this.ensureCompanyContext();
    return createEquipmentExtractionMethod(methodId, this.normalizeEquipmentBinding(value));
  }

  updateEquipmentBinding(
    methodId: string,
    bindingId: string,
    value: EquipmentExtractionMethodInput,
  ): Promise<EquipmentExtractionMethod | null> {
    this.ensureCompanyContext();
    return updateEquipmentExtractionMethod(methodId, bindingId, this.normalizeEquipmentBinding(value));
  }

  deleteEquipmentBinding(methodId: string, bindingId: string): Promise<boolean> {
    this.ensureCompanyContext();
    return deleteEquipmentExtractionMethod(methodId, bindingId);
  }

  getAvailableData(methodIds: string[]): Promise<ExtractionAvailableData[]> {
    this.ensureCompanyContext();
    return getExtractionMethodAvailableData(methodIds);
  }

  getProtocolOptions(): ExtractionMethodProtocol[] {
    return getExtractionMethodProtocolOptions();
  }

  private normalize(value: ExtractionMethodInput): ExtractionMethodInput {
    return {
      ...value,
      code: value.code.trim(),
      name: value.name.trim(),
      description: value.description?.trim() || null,
      configurationSchema: value.configurationSchema ? { ...value.configurationSchema } : null,
      parameters: value.parameters.map((parameter) => ({
        ...parameter,
        parameterKey: parameter.parameterKey.trim(),
        description: parameter.description?.trim() || null,
      })),
      requests: value.requests.map((request) => ({
        ...request,
        code: request.code.trim(),
        name: request.name.trim(),
        fields: request.fields.map((field) => ({
          ...field,
          fieldKey: field.fieldKey.trim(),
          sourcePath: field.sourcePath.trim(),
          description: field.description?.trim() || null,
          unit: field.unit?.trim() || null,
        })),
      })),
    };
  }

  private hasDuplicateNestedCodes(value: ExtractionMethodInput): boolean {
    const parameterKeys = value.parameters.map((parameter) => parameter.parameterKey.toLowerCase());
    const requestCodes = value.requests.map((request) => request.code.toLowerCase());
    return new Set(parameterKeys).size !== parameterKeys.length
      || new Set(requestCodes).size !== requestCodes.length
      || value.requests.some((request) => {
        const fieldKeys = request.fields.map((field) => field.fieldKey.toLowerCase());
        return new Set(fieldKeys).size !== fieldKeys.length;
      });
  }

  private normalizeEquipmentBinding(value: EquipmentExtractionMethodInput): EquipmentExtractionMethodInput {
    return {
      ...value,
      equipmentId: value.equipmentId.trim(),
      name: value.name.trim(),
      credentialRef: value.credentialRef?.trim() || null,
      connectionConfig: value.connectionConfig ? { ...value.connectionConfig } : null,
    };
  }
}

export const extractionMethodService = new ExtractionMethodService();