import { writable } from "svelte/store";

export const folder_types = writable([]);
// export const folderTypesLoading = writable(false);
// export const folderTypesError = writable(null);
import { API_URL } from '../../app.config';

export async function load_folder_types() {
  // folderTypesLoading.set(true);
  // folderTypesError.set(null);

  try {
    const response = await fetch(`${API_URL}/climate/get_folder_types`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    folder_types.set(data);
  } catch (err) {
    // folderTypesError.set(err.message);
  } finally {
    // folderTypesLoading.set(false);
  }
}
