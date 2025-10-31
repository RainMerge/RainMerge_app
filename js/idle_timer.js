(function() {
    const IDLE_TIMEOUT = 30000;  // 30 seconds
    const IDLE_PAGE = 'idle_index.html';
    let idleTimer;
    
    function resetTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(goIdle, IDLE_TIMEOUT);
    }
    
    function goIdle() {
        sessionStorage.setItem('returnUrl', window.location.href);
        window.location.href = IDLE_PAGE;
    }
    
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer();
    console.log('✅ Idle timer active (30s)');
})();
