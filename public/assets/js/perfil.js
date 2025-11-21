// =============================================================================
// DECLARACIÓN DE ELEMENTOS Y FUNCIONES
// =============================================================================

// Se declaran fuera para que sean accesibles en todo el script
const profileForm = document.getElementById('profile-form');
const givenNameInput = document.getElementById('profile-given-name');
const familyNameInput = document.getElementById('profile-family-name');
const nicknameInput = document.getElementById('profile-nickname');
const websiteInput = document.getElementById('profile-website');
const profileInput = document.getElementById('profile-profile');
const emailInput = document.getElementById('profile-email');
const profilePicturePreview = document.getElementById('profile-picture-preview');
const changePictureButton = document.getElementById('change-picture-button');
const profilePictureInput = document.getElementById('profile-picture-input');
const saveProfileButton = document.getElementById('save-profile-button');
const profileMessage = document.getElementById('profile-message');

let currentUser;

function loadUserProfile() {
    currentUser = window.authManager.getCurrentUser();

    if (currentUser) {
        profileForm.style.display = 'flex';
        // Rellenar el formulario con los datos del usuario
        givenNameInput.value = currentUser.given_name || '';
        familyNameInput.value = currentUser.family_name || '';
        nicknameInput.value = currentUser.nickname || '';
        websiteInput.value = currentUser.website || '';
        profileInput.value = currentUser.profile || '';
        emailInput.value = currentUser.email || 'No disponible';
        profilePicturePreview.src = currentUser.picture || '/assets/images/profile-photo.jpg';
        
        // Si no hay 'given_name' o 'family_name', intentar extraerlos de 'name'
        if (!currentUser.given_name && !currentUser.family_name && currentUser.name) {
            const nameParts = currentUser.name.split(' ');
            givenNameInput.value = nameParts[0];
            if (nameParts.length > 1) {
                familyNameInput.value = nameParts.slice(1).join(' ');
            }
        }
    } else {
        // Si no hay usuario, ocultar el formulario y mostrar un mensaje
        profileForm.style.display = 'none';
        profileMessage.textContent = 'Debes iniciar sesión para ver tu perfil.';
        profileMessage.className = 'profile-message error';
        profileMessage.style.display = 'block';
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    if (!saveProfileButton) return;
    saveProfileButton.disabled = true;
    saveProfileButton.textContent = 'Guardando...';
    profileMessage.style.display = 'none';

    // Recolectar solo los atributos que el usuario puede editar.
    const attributesToUpdate = {
        given_name: givenNameInput.value,
        family_name: familyNameInput.value,
        nickname: nicknameInput.value,
        website: websiteInput.value,
        profile: profileInput.value
    };

    try {
        await window.authManager.updateUserAttributes(attributesToUpdate);
        
        profileMessage.textContent = '¡Perfil actualizado con éxito!';
        profileMessage.className = 'profile-message success';

    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        profileMessage.textContent = `Error al actualizar: ${error.message}`;
        profileMessage.className = 'profile-message error';
    } finally {
        saveProfileButton.disabled = false;
        saveProfileButton.textContent = 'Guardar Cambios';
        profileMessage.style.display = 'block';

        setTimeout(() => {
            if (profileMessage.style.display === 'block') {
                profileMessage.style.display = 'none';
            }
        }, 5000);
    }
}

function handleChangePicture() {
    if (profilePictureInput) {
        profilePictureInput.click();
    }
}

function handlePictureFileChange(event) {
    const file = event.target.files[0];
    if (file && profilePicturePreview) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePicturePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}


// =============================================================================
// INICIALIZACIÓN
// =============================================================================

document.addEventListener('authStateReady', (event) => {
    // Una vez que el estado de autenticación está listo, procedemos.
    loadUserProfile();

    if (event.detail.isAuthenticated) {
        // Solo añadir listeners para el formulario si el usuario está autenticado
        if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);
        if (changePictureButton) changePictureButton.addEventListener('click', handleChangePicture);
        if (profilePictureInput) profilePictureInput.addEventListener('change', handlePictureFileChange);
    }
});