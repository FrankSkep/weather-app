export function showToast(message, color = 'success', duration = 2500) {
    const toastContainer = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast ${color}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" onclick="this.parentElement.style.display='none';">&times;</button>
    `;

    toastContainer.appendChild(toast);

    // Show the toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Hide the toast after the specified duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, duration);
}