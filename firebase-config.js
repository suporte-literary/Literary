// Importar os módulos específicos do Firebase que usaremos
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Suas chaves de configuração fornecidas
const firebaseConfig = {
  apiKey: "AIzaSyDgX9Itwx2KmbaTIyfPqfhOE5KhzA3IrRE",
  authDomain: "literary-1d300.firebaseapp.com",
  projectId: "literary-1d300",
  storageBucket: "literary-1d300.firebasestorage.app",
  messagingSenderId: "206620415717",
  appId: "1:206620415717:web:ebb0983ad6f2ca9d9ae60c"
};

// Inicializar o aplicativo
const app = initializeApp(firebaseConfig);

// Exportar os serviços de autenticação e banco de dados
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase está pronto.");
