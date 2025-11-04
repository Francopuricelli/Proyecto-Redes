# Configuración de Cloudinary

## Pasos para obtener tus credenciales de Cloudinary:

1. **Crear cuenta en Cloudinary** (si no tienes una):
   - Ve a https://cloudinary.com/
   - Haz clic en "Sign Up for Free"
   - Completa el registro

2. **Obtener credenciales**:
   - Inicia sesión en tu cuenta
   - Ve al Dashboard (https://cloudinary.com/console)
   - Verás tus credenciales en la sección "Account Details":
     - **Cloud Name**
     - **API Key**
     - **API Secret**

3. **Configurar el archivo .env**:
   - Abre el archivo `.env` en la raíz del proyecto backend
   - Reemplaza los valores de ejemplo con tus credenciales reales:
   ```
   CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
   CLOUDINARY_API_KEY=tu_api_key_aqui
   CLOUDINARY_API_SECRET=tu_api_secret_aqui
   ```

4. **Reiniciar el servidor**:
   ```bash
   npm run start:dev
   ```

## Características implementadas:

✅ **Publicaciones**: Las imágenes de publicaciones se suben automáticamente a Cloudinary
✅ **Carpetas organizadas**: Las imágenes se guardan en la carpeta "publicaciones" en Cloudinary
✅ **URLs seguras**: Se utilizan URLs HTTPS de Cloudinary
✅ **Sin almacenamiento local**: Ya no se guardan archivos en el servidor

## Próximos pasos:

- [ ] Implementar upload de imágenes de perfil de usuario con Cloudinary
- [ ] Agregar modo oscuro al frontend
