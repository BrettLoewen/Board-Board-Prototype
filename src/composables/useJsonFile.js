import { ref } from "vue";

export function useJsonFile() {
  const importedData = ref(null);

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
  function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        importedData.value = JSON.parse(e.target.result);
      } catch (err) {
        console.error("Invalid JSON file:", err);
      }
    };
    reader.readAsText(file);
  }

  return {
    importedData,
    exportJson,
    importJson,
  };
}
