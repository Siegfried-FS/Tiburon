// ASCII Art para Tiburón - Dibujo de Tiburón
function showSharkArt() {
    const sharkArt = `
                              ___
                         _..-'   '-..
                      .-'           '-.
                    .'                 '.
                   /                     \\
                  ;                       ;
                 ;                         ;
                ;             ___           ;
               ;           .-'   '-.         ;
              ;          .'         '.       ;
             ;          /             \\       ;
            ;          ;               ;      ;
           ;           ;      ___      ;       ;
          ;            ;   .-'   '-.   ;        ;
         ;             ; .'         '. ;         ;
        ;              ;/             \\;          ;
       ;               ;               ;           ;
      ;                ;               ;            ;
     ;                 ;               ;             ;
    ;                  ;               ;              ;
   ;                   ;               ;               ;
  ;                    ;               ;                ;
 ;                     ;               ;                 ;
;                      ;               ;                  ;
;                      ;               ;                  ;
;                      ;               ;                  ;
 ;                     ;               ;                 ;
  ;                    ;               ;                ;
   ;                   ;               ;               ;
    ;                  ;               ;              ;
     ;                 ;               ;             ;
      ;                ;               ;            ;
       ;               ;               ;           ;
        ;              ;\\             /;          ;
         ;             ; '.         .' ;         ;
          ;            ;   '-.___.-'   ;        ;
           ;           ;               ;       ;
            ;          ;               ;      ;
             ;          \\             /       ;
              ;          '.         .'       ;
               ;           '-.___.-'         ;
                ;                           ;
                 ;                         ;
                  ;                       ;
                   \\                     /
                    '.                 .'
                      '-.           .-'
                         '-..___..-'

    🦈 PROYECTO TIBURÓN - Nunca paro de aprender 🦈
    `;
    
    console.log(sharkArt);
    
    // Mostrar en la página
    const artContainer = document.createElement('div');
    artContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 20, 40, 0.95);
        color: #00d4ff;
        font-family: 'Courier New', monospace;
        font-size: 8px;
        padding: 20px;
        border-radius: 15px;
        border: 3px solid #00d4ff;
        z-index: 1000;
        white-space: pre;
        box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
        animation: sharkSwim 3s ease-in;
        cursor: pointer;
        text-align: center;
    `;
    
    artContainer.textContent = sharkArt;
    artContainer.title = "🦈 Click para que el tiburón se vaya nadando";
    artContainer.onclick = () => {
        artContainer.style.animation = 'sharkSwimAway 2s ease-out forwards';
        setTimeout(() => artContainer.remove(), 2000);
    };
    
    document.body.appendChild(artContainer);
    
    // Auto-ocultar después de 12 segundos
    setTimeout(() => {
        if (artContainer.parentNode) {
            artContainer.style.animation = 'sharkSwimAway 2s ease-out forwards';
            setTimeout(() => artContainer.remove(), 2000);
        }
    }, 12000);
}

// CSS para animaciones de tiburón
const style = document.createElement('style');
style.textContent = `
    @keyframes sharkSwim {
        0% { 
            opacity: 0; 
            transform: translate(-150%, -50%) rotate(-10deg); 
        }
        50% { 
            transform: translate(-50%, -60%) rotate(2deg); 
        }
        100% { 
            opacity: 1; 
            transform: translate(-50%, -50%) rotate(0deg); 
        }
    }
    @keyframes sharkSwimAway {
        0% { 
            opacity: 1; 
            transform: translate(-50%, -50%) rotate(0deg); 
        }
        100% { 
            opacity: 0; 
            transform: translate(150%, -50%) rotate(10deg); 
        }
    }
`;
document.head.appendChild(style);

// Ejecutar cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showSharkArt, 3000);
});
