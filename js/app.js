let sidebarCollapsed = false;
let activeSubMenuId = null;

/* ============================================================
  Handles tasks that should run once the page has fully loaded.
=============================================================== */
window.addEventListener("load", function () {
  let preloader = document.getElementById("loader");
  if (preloader) {
    preloader.classList.add("hidden");
  }
});

/* ============================================================
  Global Click Events.
=============================================================== */
document.addEventListener("click", function (event) {
  // Toggle sidebar visibility
  if (event.target.classList.contains("toggle-sidebar")) {
    toggleSidebar();
  }

  // Handle sidebar submenu toggle
  if (event.target.classList.contains("has-submenu")) {
    handleMenuClick(event.target.id);
  }

  // Open modal window
  if (event.target.classList.contains("open-modal")) {
    openModal(event.target.getAttribute("data-targetModalId"));
  }

  // Close modal window
  if (event.target.classList.contains("close-modal")) {
    closeModal(event.target.getAttribute("data-targetModalId"));
  }

  // Handle tab switching
  if (event.target.classList.contains("tab-button")) {
    toggleTabs(event);
  }
});

document.addEventListener("change", function (event) {
  if (event.target.classList.contains("image-upload&preview")) {
    handleImageUpload(event.target);
  }
});

// Highlight active sidebar menu item on page load
markActiveMenu();

/* ===================================================================
  Opens a modal by making it visible and applying the entry animation.
==================================================================== */
function openModal(modalBtnId) {
  const modal = document.getElementById(`${modalBtnId}`);
  modal.classList.remove("hidden");
  modal.classList.add("modal-enter");
}

/* =========================================================================================
  Closes a modal by triggering the exit animationand hiding it after the animation completes.
============================================================================================ */
function closeModal(modalBtnId) {
  const modal = document.getElementById(`${modalBtnId}`);
  modal.classList.remove("modal-enter");
  modal.classList.add("modal-exit");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("modal-exit");
  }, 500);
}

/* ====================================================================
  Handles image uploads and previews them in the specified container.
=======================================================================*/
function handleImageUpload(target) {
  const previewSectionId = target.getAttribute("data-previewSectionId");
  if (!previewSectionId) return;

  const previewContainer = document.getElementById(previewSectionId);
  if (!previewContainer) return;

  // Clear previous preview if single file upload
  if (!target.multiple) {
    previewContainer.innerHTML = "";
  }

  previewContainer.classList.remove("hidden");
  const files = Array.from(target.files);

  files.forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgWrapper = document.createElement("div");
      imgWrapper.classList.add("relative", "inline-flex", "gap-2");

      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = file.name;
      img.classList.add("w-24", "h-24", "object-cover", "rounded", "border");

      imgWrapper.appendChild(img);
      addRemoveButton(imgWrapper, target);

      previewContainer.appendChild(imgWrapper);
    };
    reader.readAsDataURL(file);
  });
}

/* ==============================================================================
Adds a small remove button to an image wrapper, allowing users to remove the image.
=================================================================================*/
function addRemoveButton(wrapper, target) {
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "×";
  removeBtn.classList.add(
    "absolute",
    "top-0",
    "right-0",
    "bg-red-500",
    "text-white",
    "rounded-full",
    "w-5",
    "h-5",
    "flex",
    "items-center",
    "justify-center",
    "text-xs"
  );

  removeBtn.addEventListener("click", () => {
    wrapper.remove();
    if (!target.multiple) target.value = "";
  });

  wrapper.appendChild(removeBtn);
}

/* ================================
  Toggles sidebar visibility.
=================================== */
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const isLargeScreen = window.innerWidth >= 1024;

  if (!isLargeScreen) {
    sidebar.classList.toggle("-translate-x-full");
    sidebar.classList.toggle("translate-x-0");
  } else {
    // Desktop behavior - collapse/expand
    const searchBar = document.getElementById("search-bar");
    const logo = document.getElementById("logo");
    const sidebarTexts = document.querySelectorAll(".sidebar-text");
    const sidebarSubmenus = document.querySelectorAll(".sidebar-submenu");
    const sidebarSubmenuIcons = document.querySelectorAll(
      ".sidebar-submenu-icon"
    );

    sidebarCollapsed = !sidebarCollapsed;

    if (sidebarCollapsed) {
      //collapse sidebar
      sidebar.classList.remove("w-64");
      sidebar.classList.add("w-20");
      searchBar.classList.add("hidden");
      logo.classList.add("hidden");
      sidebarTexts.forEach((text) => text.classList.add("hidden"));
      sidebarSubmenus.forEach((submenu) => submenu.classList.add("hidden"));
      sidebarSubmenuIcons.forEach((icon) => {
        icon.classList.remove("rotate-90");
      });
    } else {
      //expand sidebar
      sidebar.classList.remove("w-20");
      sidebar.classList.add("w-64");
      searchBar.classList.remove("hidden");
      logo.classList.remove("hidden");
      sidebarTexts.forEach((text) => text.classList.remove("hidden"));

      if (activeSubMenuId) {
        toggleSubmenu(activeSubMenuId);
      }
    }
  }
}

/* ================================================
   Handles click on a menu item that has a submenu.
================================================== */
function handleMenuClick(id) {
  const isLargeScreen = window.innerWidth >= 1024;

  activeSubMenuId == id ? (activeSubMenuId = null) : (activeSubMenuId = id);

  if (isLargeScreen && sidebarCollapsed) {
    toggleSidebar();
    setTimeout(() => {
      toggleSubmenu(id);
    }, 100);
  } else {
    toggleSubmenu(id);
  }
}

/* =============================================================
   Highlights the active menu item based on the current  path.
================================================================ */
function markActiveMenu() {
  const navLinks = document.querySelectorAll("nav a[data-nav], nav > div > a");

  const currentFile = window.location.pathname.split("/").pop();

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const linkFile = href.split("/").pop();

    if (currentFile === linkFile) {
      link.classList.add("bg-blue-100", "text-black");
      const submenu = link.closest(".sidebar-submenu");
      if (submenu) {
        submenu.classList.remove("hidden");

        const parentButton = submenu.previousElementSibling;
        if (parentButton && parentButton.classList.contains("has-submenu")) {
          activeSubMenuId = parentButton.id;
          parentButton.classList.add("bg-indigo-100");

          const icon = parentButton.querySelector(".sidebar-submenu-icon");
          if (icon) icon.classList.add("rotate-90");
        }
      }
    }
  });
}

/* ==============================================================
   Toggles visibility of a submenu and rotates its indicator icon.
================================================================ */
function toggleSubmenu(id) {
  const submenu = document.getElementById(id + "-submenu");
  const icon = document.getElementById(id + "-icon");
  submenu.classList.toggle("hidden");
  icon.classList.toggle("rotate-90");
}

/* ================================
   Handles tab switching logic.
=================================== */
function toggleTabs(event) {
  const target = event.target;

  let tabContentId = target.getAttribute("data-targetId");

  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  const parentTabButtons = document.querySelectorAll(".parent-tab-button");

  resetTabButtons(tabButtons);
  hideAllTabContents(tabContents);
  resetParentTabs(parentTabButtons);

  if (isParentTab(target)) {
    activateParentTab(target);
  } else {
    handleChildOrNormalTab(target, parentTabButtons);
    tabContentId = resolveParentTabContent(target, tabContentId);
  }

  showTabContent(tabContentId);
}

/* ================= Helper Functions ================= */

/* =======================================
Removes active styles from all tab buttons.
========================================== */
function resetTabButtons(buttons) {
  buttons.forEach((btn) => btn.classList.remove("bg-blue-100", "text-black"));
}

/* =======================================
Hides all tab content sections.
========================================== */
function hideAllTabContents(contents) {
  contents.forEach((content) => content.classList.add("hidden"));
}

/* =============================================
Resets parent tab buttons to their default state.
=============================================== */
function resetParentTabs(parentTabs) {
  parentTabs.forEach((btn) => {
    btn.classList.remove("bg-blue-600");
    btn.classList.add("bg-blue-500", "text-white");
  });
}

/* ===============================================
Determines whether the clicked tab is a parent tab.
================================================= */
function isParentTab(target) {
  return target.classList.contains("parent-tab-button");
}

/* ===============================================
Activates a parent tab visually.
================================================= */
function activateParentTab(target) {
  target.classList.add("bg-blue-600", "text-white");
  target.classList.remove("bg-blue-100", "text-blue-700");
}

/* ===============================================
Handles normal and child tab activation logic.
================================================= */
function handleChildOrNormalTab(target) {
  target.classList.add("bg-blue-100", "text-black");

  if (target.hasAttribute("data-parentTabBtnId")) {
    const parentBtnId = target.getAttribute("data-parentTabBtnId");
    document
      .getElementById(parentBtnId)
      .classList.add("bg-blue-100", "text-black");
  }

  if (target.classList.contains("add-slide-btn")) {
    setupCancelSlideButton(target);
  }
  if (target.classList.contains("edit-slide-btn")) {
    setupCancelSlideButton(target, "edit");
  }
}

/* =================================================================================
Resolves the correct tab content ID when dealing with parent-child tab relationships.
================================================================================== */
function resolveParentTabContent(target, tabContentId) {
  if (
    target.classList.contains("tab-button") &&
    target.classList.contains("has-parent-tab")
  ) {
    const parentTabId = target.getAttribute("data-parentTabId");

    document
      .querySelector(`[data-targetId="${parentTabId}"]`)
      .classList.add("bg-blue-100", "text-black");

    return parentTabId;
  }

  return tabContentId;
}

/* =====================================================
Configures cancel button behavior for slide actions.
=========================================================*/
function setupCancelSlideButton(target, cancelBtnFor = "add") {
  let cancelBtn = document.querySelector(".cancel-slide-addition");

  if (cancelBtnFor != "add") {
    cancelBtn = document.querySelector(".cancel-slide-edition");
  }

  cancelBtn.classList.add("has-parent-tab");
  cancelBtn.setAttribute(
    "data-parentTabId",
    target.getAttribute("data-parentTabId")
  );
}

/* =====================================================
Displays the requested tab content.
=========================================================*/
function showTabContent(tabContentId) {
  document.getElementById(tabContentId).classList.remove("hidden");
}
