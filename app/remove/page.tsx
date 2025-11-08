const handleUpload = async () => {
  if (!file) return;
  setLoading(true);

  try {
    // Compress if large
    let uploadFile = file;
    if (file.size > 1 * 1024 * 1024) {
      uploadFile = await compressImage(file);
    }

    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(uploadFile);
    reader.onload = async () => {
      const base64Image = reader.result as string;

      // Call API with base64
      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      const { result } = await res.json();
      setResult(result);
    };
  } catch (error: any) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
};
