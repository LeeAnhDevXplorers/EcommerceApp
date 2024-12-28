document.addEventListener("DOMContentLoaded", () => {
  const deleteIcons = document.querySelectorAll(".delete-icon");

  deleteIcons.forEach((icon) => {
    icon.addEventListener("click", async (event) => {
      const publicId = event.target.dataset.publicId;

      if (!publicId) {
        alert("Public ID not found.");
        return;
      }

      try {
        const response = await fetch("http://localhost:4000/api/products/delete-image", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicId }),
        });

        const result = await response.json();

        if (result.success) {
          alert("Image deleted successfully.");
          event.target.closest(".image-container").remove();
        } else {
          alert("Failed to delete image.");
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        alert("Server error. Please try again later.");
      }
    });
  });
});