"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const profileForm =
    document.getElementById("profileForm");

  const profileAvatar =
    document.getElementById("profileAvatar");

  const profileImageInput =
    document.getElementById("profileImageInput");

  const profileDisplayName =
    document.getElementById("profileDisplayName");

  const profileDisplayEmail =
    document.getElementById("profileDisplayEmail");

  const navbarUserName =
    document.getElementById("navbarUserName");

  const completionValue =
    document.getElementById("completionValue");

  const completionProgress =
    document.getElementById("completionProgress");

  const cancelButton =
    document.getElementById("cancelProfileChanges");

  const cvFileInput =
    document.getElementById("cvFile");

  const cvFileMessage =
    document.getElementById("cvFileMessage");

  const selectedCv =
    document.getElementById("selectedCv");

  const selectedCvName =
    document.getElementById("selectedCvName");

  const removeCvButton =
    document.getElementById("removeCvButton");

  const profileFieldIds = [
    "firstName",
    "lastName",
    "emailAddress",
    "phoneNumber",
    "city",
    "preferredLanguage",
    "address",
    "profileNote",
    "educationLevel",
    "university",
    "major",
    "graduationYear",
    "gpa",
    "employmentStatus",
    "yearsExperience",
    "skills",
    "linkedinUrl",
    "portfolioUrl",
    "professionalSummary",
    "emergencyName",
    "emergencyPhone",
  ];

  let selectedCvFileName = "";

  const defaultProfile = {
    firstName: "Tariq",
    lastName: "Bataineh",
    emailAddress: "tariq@example.com",
    phoneNumber: "+962 7 9000 0000",
    city: "Amman",
    preferredLanguage: "English",
    address: "",
    profileNote: "",

    educationLevel: "",
    university: "",
    major: "",
    graduationYear: "",
    gpa: "",
    employmentStatus: "",
    yearsExperience: "",
    skills: "",
    linkedinUrl: "",
    portfolioUrl: "",
    professionalSummary: "",
    cvFileName: "",

    emergencyName: "",
    emergencyPhone: "",
  };

  const getSavedProfile = () => {
    const savedProfile =
      localStorage.getItem(
        "wusool-user-profile",
      );

    if (!savedProfile) {
      return defaultProfile;
    }

    try {
      return {
        ...defaultProfile,
        ...JSON.parse(savedProfile),
      };
    } catch {
      return defaultProfile;
    }
  };

  const getField = (fieldId) => {
    return document.getElementById(fieldId);
  };

  const fillProfileForm = (profile) => {
    profileFieldIds.forEach((fieldId) => {
      const field = getField(fieldId);

      if (field) {
        field.value =
          profile[fieldId] || "";
      }
    });

    selectedCvFileName =
      profile.cvFileName || "";

    updateCvDisplay();
    updateProfileSummary(profile);
    updateProfileCompletion(profile);
  };

  const collectProfileData = () => {
    const profileData = {};

    profileFieldIds.forEach((fieldId) => {
      const field = getField(fieldId);

      profileData[fieldId] =
        field.value.trim();
    });

    profileData.cvFileName =
      selectedCvFileName;

    return profileData;
  };

  const updateProfileSummary = (profile) => {
    const fullName =
      `${profile.firstName} ${profile.lastName}`.trim();

    profileDisplayName.textContent =
      fullName || "Wusool User";

    profileDisplayEmail.textContent =
      profile.emailAddress ||
      "No email address";

    navbarUserName.textContent =
      profile.firstName || "User";

    if (
      !profileAvatar.querySelector("img")
    ) {
      profileAvatar.textContent =
        (
          profile.firstName.charAt(0) ||
          "U"
        ).toUpperCase();
    }

    localStorage.setItem(
      "wusool-user-name",
      profile.firstName || "User",
    );
  };

  const updateProfileCompletion = (
    profile,
  ) => {
    const completionFields = [
      profile.firstName,
      profile.lastName,
      profile.emailAddress,
      profile.phoneNumber,
      profile.city,
      profile.educationLevel,
      profile.university,
      profile.major,
      profile.graduationYear,
      profile.employmentStatus,
      profile.skills,
      profile.professionalSummary,
      profile.cvFileName,
    ];

    const completedFields =
      completionFields.filter((field) => {
        return String(field).trim() !== "";
      }).length;

    const completionPercentage =
      Math.round(
        (completedFields /
          completionFields.length) *
          100,
      );

    completionValue.textContent =
      `${completionPercentage}%`;

    completionProgress.style.width =
      `${completionPercentage}%`;

    completionProgress
      .parentElement
      .setAttribute(
        "aria-valuenow",
        completionPercentage,
      );
  };

  const updateCvDisplay = () => {
    if (!selectedCvFileName) {
      selectedCv.classList.add("d-none");

      cvFileMessage.textContent =
        "PDF, DOC, or DOCX. Maximum size: 5 MB.";

      return;
    }

    selectedCvName.textContent =
      selectedCvFileName;

    selectedCv.classList.remove("d-none");

    cvFileMessage.textContent =
      "Your CV is ready to use.";
  };

  profileForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      if (!profileForm.checkValidity()) {
        event.stopPropagation();

        profileForm.classList.add(
          "was-validated",
        );

        showStatusMessage(
          "Complete the required profile information.",
        );

        return;
      }

      const profileData =
        collectProfileData();

      localStorage.setItem(
        "wusool-user-profile",
        JSON.stringify(profileData),
      );

      updateProfileSummary(profileData);
      updateProfileCompletion(profileData);

      profileForm.classList.remove(
        "was-validated",
      );

      showStatusMessage(
        "Your profile was updated successfully.",
      );
    },
  );

  cancelButton.addEventListener(
    "click",
    () => {
      fillProfileForm(
        getSavedProfile(),
      );

      profileForm.classList.remove(
        "was-validated",
      );

      showStatusMessage(
        "Unsaved changes were cancelled.",
      );
    },
  );

  profileImageInput.addEventListener(
    "change",
    () => {
      const selectedImage =
        profileImageInput.files[0];

      if (!selectedImage) {
        return;
      }

      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedImageTypes.includes(
          selectedImage.type,
        )
      ) {
        profileImageInput.value = "";

        showStatusMessage(
          "Choose a PNG, JPG, or WEBP image.",
        );

        return;
      }

      const imageReader =
        new FileReader();

      imageReader.addEventListener(
        "load",
        () => {
          const profileImage =
            document.createElement("img");

          profileImage.src =
            imageReader.result;

          profileImage.alt =
            "Selected profile image";

          profileAvatar.innerHTML = "";

          profileAvatar.appendChild(
            profileImage,
          );

          showStatusMessage(
            "Profile image selected.",
          );
        },
      );

      imageReader.readAsDataURL(
        selectedImage,
      );
    },
  );

  cvFileInput.addEventListener(
    "change",
    () => {
      const selectedFile =
        cvFileInput.files[0];

      if (!selectedFile) {
        return;
      }

      const maximumFileSize =
        5 * 1024 * 1024;

      const allowedExtensions = [
        "pdf",
        "doc",
        "docx",
      ];

      const fileExtension =
        selectedFile.name
          .split(".")
          .pop()
          .toLowerCase();

      if (
        !allowedExtensions.includes(
          fileExtension,
        )
      ) {
        cvFileInput.value = "";

        showStatusMessage(
          "Upload a PDF, DOC, or DOCX file.",
        );

        return;
      }

      if (
        selectedFile.size >
        maximumFileSize
      ) {
        cvFileInput.value = "";

        showStatusMessage(
          "The CV file must be smaller than 5 MB.",
        );

        return;
      }

      selectedCvFileName =
        selectedFile.name;

      updateCvDisplay();

      showStatusMessage(
        "CV selected successfully.",
      );
    },
  );

  removeCvButton.addEventListener(
    "click",
    () => {
      selectedCvFileName = "";
      cvFileInput.value = "";

      updateCvDisplay();

      showStatusMessage(
        "The selected CV was removed.",
      );
    },
  );

  fillProfileForm(getSavedProfile());
});