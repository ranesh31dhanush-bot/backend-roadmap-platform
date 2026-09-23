import { fetchApi } from "./client";
import { CapstoneProjectListResponse } from "@top1/shared";

/**
 * PROJ-001: Fetch all capstone project specifications.
 */
export async function fetchCapstoneProjects(): Promise<CapstoneProjectListResponse> {
  return fetchApi<CapstoneProjectListResponse>("/projects");
}
