export function useJsonFile() {
  /** Export any JS object as a JSON file */
  function exportJson(data, filename = "data.json") {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export JSON:", err);
    }
  }

  /** Import JSON file and update `importedData` */
  async function importJson(event) {
    try {
      const file = event.target.files[0];
      if (!file) return null;

      const text = await file.text();
      const json = JSON.parse(text);

      return json; // return the actual JSON immediately
    } catch (err) {
      console.error("Failed to import JSON:", err);
      return null;
    }
  }

  return {
    exportJson,
    importJson,
  };
}
