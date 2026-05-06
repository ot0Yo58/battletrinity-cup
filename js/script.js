document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-button");
  const pageLinks = document.querySelectorAll(".page-link");
  const sections = document.querySelectorAll(".page-section");

  const winnerModal = document.querySelector(".winner-modal");
  const winnerModalImage = document.querySelector(".winner-modal-image");
  const winnerModalEvent = document.querySelector(".winner-modal-event");
  const winnerModalTeam = document.querySelector(".winner-modal-team");
  const winnerModalMembers = document.querySelector(".winner-modal-members");
  const winnerModalMessage = document.querySelector(".winner-modal-message");
  const winnerModalTriggers = document.querySelectorAll(".winner-modal-trigger");
  const modalCloseButtons = document.querySelectorAll("[data-modal-close]");

  const validPages = Array.from(sections).map((section) => section.id);

  const closeMenu = () => {
    document.body.classList.remove("menu-open");

    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
    }
  };

  const showPage = (pageId, shouldUpdateHash = true) => {
    const targetPage = validPages.includes(pageId) ? pageId : "home";

    sections.forEach((section) => {
      section.classList.toggle("active", section.id === targetPage);
    });

    pageLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.page === targetPage);
    });

    closeMenu();

    if (shouldUpdateHash) {
      history.pushState(null, "", `#${targetPage}`);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  pageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const pageId = link.dataset.page;
      showPage(pageId);
    });
  });

  window.addEventListener("popstate", () => {
    const pageId = location.hash.replace("#", "") || "home";
    showPage(pageId, false);
  });

  const initialPage = location.hash.replace("#", "") || "home";
  showPage(initialPage, false);

  const openWinnerModal = (card) => {
    if (!winnerModal) return;

    const eventName = card.dataset.event || "";
    const teamName = card.dataset.team || "";
    const members = card.dataset.members || "";
    const image = card.dataset.image || "";
    const message = card.dataset.message || "";

    winnerModalEvent.textContent = eventName;
    winnerModalTeam.textContent = teamName;
    winnerModalMembers.textContent = members;
    winnerModalMessage.textContent = message;

    winnerModalImage.src = image;
    winnerModalImage.alt = `${eventName} 優勝チーム ${teamName}`;

    winnerModal.classList.add("active");
    winnerModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeWinnerModal = () => {
    if (!winnerModal) return;

    winnerModal.classList.remove("active");
    winnerModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  winnerModalTriggers.forEach((card) => {
    card.addEventListener("click", () => {
      openWinnerModal(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openWinnerModal(card);
      }
    });
  });

  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeWinnerModal();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeWinnerModal();
    }
  });
});