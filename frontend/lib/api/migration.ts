import { fetchApi } from "./client";
import {
  LegacyMigrationPayloadDTO,
  MigrationImportResultDTO,
  MigrationStatusDTO,
} from "@top1/shared";

export async function importLegacyProgress(
  payload: LegacyMigrationPayloadDTO,
): Promise<MigrationImportResultDTO> {
  return fetchApi<MigrationImportResultDTO>("/migration/import", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMigrationStatus(): Promise<MigrationStatusDTO> {
  return fetchApi<MigrationStatusDTO>("/migration/status");
}
