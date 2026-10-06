const API_URL = "http://localhost:8080/notes";

// Store pinned material IDs in the browser
let pinnedMaterials = JSON.parse(
    localStorage.getItem("pinnedMaterials") || "[]"
);


// =========================
// LOAD ALL MATERIALS
// =========================

async function loadMaterials() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load materials");
        }

        const materials = await response.json();

        const container = document.getElementById("materials-container");

        container.innerHTML = "";

        // Show pinned materials first
        materials.sort((a, b) => {

            const aPinned = pinnedMaterials.includes(a.id);
            const bPinned = pinnedMaterials.includes(b.id);

            return bPinned - aPinned;
        });


        materials.forEach(note => {

            const card = document.createElement("div");

            card.className = "material-card";

            if (pinnedMaterials.includes(note.id)) {
                card.classList.add("pinned");
            }


            // =========================
            // TITLE
            // =========================

           const title = document.createElement("h3");

title.className = "material-title";

title.textContent = note.title;


            // =========================
            // CONTENT
            // =========================

            const content = document.createElement("p");

            content.className = "material-content";

            content.textContent = note.content;


            // =========================
            // THREE DOT BUTTON
            // =========================

            const menuButton = document.createElement("button");

            menuButton.className = "menu-button";

            menuButton.textContent = "⋮";

            menuButton.title = "More options";


            // =========================
            // THREE DOT MENU
            // =========================

            const menu = document.createElement("div");

            menu.className = "material-menu";

            menu.style.display = "none";


            // Rename
            const renameButton = document.createElement("button");

            renameButton.className = "menu-item";

            renameButton.textContent = "✏ Rename";


            // Edit
            const editButton = document.createElement("button");

            editButton.className = "menu-item";

            editButton.textContent = "✎ Edit";


            // Pin
            const pinButton = document.createElement("button");

            pinButton.className = "menu-item";

            if (pinnedMaterials.includes(note.id)) {
                pinButton.textContent = "📌 Unpin";
            } else {
                pinButton.textContent = "📌 Pin";
            }


            // Delete
            const deleteButton = document.createElement("button");

            deleteButton.className = "menu-item delete-item";

            deleteButton.textContent = "🗑 Delete";


            // Add buttons to menu

            menu.appendChild(renameButton);
            menu.appendChild(editButton);
            menu.appendChild(pinButton);
            menu.appendChild(deleteButton);


            // Add everything to card

            card.appendChild(menuButton);
            card.appendChild(menu);
            card.appendChild(title);
            card.appendChild(content);


            container.appendChild(card);


            // =========================
            // THREE DOT CLICK
            // =========================

            menuButton.addEventListener("click", function(event) {

                event.stopPropagation();

                // Close other menus
                document.querySelectorAll(".material-menu").forEach(otherMenu => {

                    if (otherMenu !== menu) {
                        otherMenu.style.display = "none";
                    }

                });

                // Toggle current menu

                if (menu.style.display === "none") {
                    menu.style.display = "block";
                } else {
                    menu.style.display = "none";
                }

            });


            // =========================
            // RENAME
            // =========================

            renameButton.addEventListener("click", async function() {

                menu.style.display = "none";

                const newTitle = prompt(
                    "Enter new title:",
                    note.title
                );

                if (newTitle === null) {
                    return;
                }

                if (newTitle.trim() === "") {
                    alert("Title cannot be empty.");
                    return;
                }

                try {

                    const response = await fetch(
                        `${API_URL}/${note.id}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                title: newTitle.trim(),
                                content: note.content
                            })
                        }
                    );


                    if (response.ok) {

                        alert("Material renamed successfully!");

                        await loadMaterials();

                    } else {

                        alert("Failed to rename material.");

                    }

                } catch (error) {

                    console.error("Error renaming material:", error);

                    alert("Unable to connect to the server.");

                }

            });


            // =========================
            // EDIT
            // =========================

            editButton.addEventListener("click", function() {

                menu.style.display = "none";

                editMaterial(note.id);

            });


            // =========================
            // PIN / UNPIN
            // =========================

            pinButton.addEventListener("click", function() {

                menu.style.display = "none";

                if (pinnedMaterials.includes(note.id)) {

                    // Unpin
                    pinnedMaterials = pinnedMaterials.filter(
                        id => id !== note.id
                    );

                } else {

                    // Pin
                    pinnedMaterials.push(note.id);

                }

                localStorage.setItem(
                    "pinnedMaterials",
                    JSON.stringify(pinnedMaterials)
                );

                loadMaterials();

            });


            // =========================
            // DELETE
            // =========================

            deleteButton.addEventListener("click", async function() {

                menu.style.display = "none";

                deleteMaterial(note.id);

            });

        });

    } catch (error) {

        console.error("Error loading materials:", error);

        const container = document.getElementById("materials-container");

        container.innerHTML = `
            <p>⚠️ Unable to connect to Study Buddy server.</p>
        `;
    }
}


// =========================
// POST MATERIAL
// =========================

async function postMaterial(title, content) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title,
                content: content
            })

        });


        if (!response.ok) {
            throw new Error("Failed to post material");
        }


        const newMaterial = await response.json();

        console.log("Material posted:", newMaterial);

        alert("Material posted successfully!");

    } catch (error) {

        console.error("Error posting material:", error);

        alert("Unable to post material.");

    }
}


// =========================
// EDIT MATERIAL
// =========================

async function editMaterial(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {

            alert("Material not found.");

            return;
        }


        const material = await response.json();


        document.getElementById("title").value =
            material.title;

        document.getElementById("content").value =
            material.content;


        const form =
            document.getElementById("material-form");


        form.dataset.editingId = id;


        document.getElementById("submit-button").textContent =
            "Update Material";


        window.scrollTo({

            top: document.body.scrollHeight,

            behavior: "smooth"

        });

    } catch (error) {

        console.error(
            "Error loading material:",
            error
        );

    }
}


// =========================
// DELETE MATERIAL
// =========================

async function deleteMaterial(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this material?"
    );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        if (response.ok) {

            alert(
                "Material deleted successfully!"
            );

            // Remove from pinned list also

            pinnedMaterials =
                pinnedMaterials.filter(
                    pinnedId => pinnedId !== id
                );

            localStorage.setItem(
                "pinnedMaterials",
                JSON.stringify(pinnedMaterials)
            );


            await loadMaterials();

        } else {

            alert(
                "Failed to delete material."
            );

        }

    } catch (error) {

        console.error(
            "Error deleting material:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

    }
}


// =========================
// FORM SUBMISSION
// =========================

document
    .getElementById("material-form")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const title =
                document.getElementById("title").value.trim();

            const content =
                document.getElementById("content").value.trim();


            // Validation

            if (!title || !content) {

                alert(
                    "Please enter both title and content."
                );

                return;
            }


            const editingId =
                this.dataset.editingId;


            // =========================
            // UPDATE
            // =========================

            if (editingId) {

                try {

                    const response = await fetch(
                        `${API_URL}/${editingId}`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                title: title,

                                content: content

                            })

                        }
                    );


                    if (response.ok) {

                        alert(
                            "Material updated successfully!"
                        );


                        this.reset();


                        delete this.dataset.editingId;


                        document
                            .getElementById(
                                "submit-button"
                            )
                            .textContent =
                            "Post Material";


                        await loadMaterials();

                    } else {

                        alert(
                            "Failed to update material."
                        );

                    }

                } catch (error) {

                    console.error(
                        "Error updating material:",
                        error
                    );

                }

            }


            // =========================
            // CREATE
            // =========================

            else {

                await postMaterial(
                    title,
                    content
                );


                this.reset();


                await loadMaterials();

            }

        }
    );


// =========================
// CLOSE MENUS WHEN CLICKING OUTSIDE
// =========================

document.addEventListener(
    "click",
    function() {

        document
            .querySelectorAll(".material-menu")
            .forEach(menu => {

                menu.style.display = "none";

            });

    }
);


// =========================
// LOAD MATERIALS
// =========================

loadMaterials();