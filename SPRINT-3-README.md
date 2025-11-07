# Sprint #3 - Sistema de Autenticación y Gestión de Sesiones

## 📋 Tabla de Contenidos
1. [Resumen General](#resumen-general)
2. [Cambios en el Backend](#cambios-en-el-backend)
3. [Cambios en el Frontend](#cambios-en-el-frontend)
4. [Flujo de Autenticación](#flujo-de-autenticación)
5. [Gestión de Sesiones](#gestión-de-sesiones)
6. [Sistema de Comentarios](#sistema-de-comentarios)

---

## 🎯 Resumen General

Este Sprint implementa un sistema completo de autenticación con JWT de corta duración, gestión avanzada de sesiones, y funcionalidad completa de comentarios con paginación y edición.

### Características Principales:
- ✅ **Tokens JWT de 15 minutos** para mayor seguridad
- ✅ **Validación y renovación de tokens** automática
- ✅ **Sistema de comentarios** con paginación y edición
- ✅ **Gestión de sesión** con temporizador de 10 minutos
- ✅ **Interceptor HTTP** para manejo de errores 401
- ✅ **Loading screen** con validación inicial de token

---

## 🔧 Cambios en el Backend

### 1. Configuración de JWT (auth.module.ts)

**Archivo:** `red-social-backend/src/auth/auth.module.ts`

```typescript
signOptions: { expiresIn: '15m' }  // Cambiado de '24h' a '15m'
```

**Qué hace:**
- Define que los tokens JWT expiran en **15 minutos** en lugar de 24 horas
- Mejora la seguridad al reducir el tiempo de validez de cada token
- Requiere que los usuarios renueven su token periódicamente

---

### 2. Nuevos Endpoints de Autenticación (auth.controller.ts)

**Archivo:** `red-social-backend/src/auth/auth.controller.ts`

#### POST /auth/autorizar
```typescript
@UseGuards(JwtAuthGuard)
@Post('autorizar')
async autorizar(@Request() req) {
  return await this.authService.getUserData(req.user.id);
}
```

**Qué hace:**
- Valida que el token JWT en el header sea válido
- Retorna los datos completos del usuario (sin contraseña)
- Retorna error 401 si el token es inválido o expirado
- Se usa en el **loading screen inicial** del frontend

**Respuesta exitosa (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan@example.com",
  "nombreUsuario": "juanp",
  "imagenPerfil": "https://..."
}
```

#### POST /auth/refrescar
```typescript
@UseGuards(JwtAuthGuard)
@Post('refrescar')
async refrescar(@Request() req) {
  return await this.authService.refreshToken(req.user.id);
}
```

**Qué hace:**
- Valida el token actual del usuario
- Genera un **nuevo token JWT** con 15 minutos de duración
- Mantiene el mismo payload (correo y ID de usuario)
- Se usa cuando el usuario extiende su sesión

**Respuesta exitosa (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Métodos del Servicio de Autenticación (auth.service.ts)

**Archivo:** `red-social-backend/src/auth/auth.service.ts`

#### getUserData()
```typescript
async getUserData(userId: string): Promise<any> {
  const user = await this.usersService.findById(userId);
  
  if (!user) {
    throw new UnauthorizedException('Usuario no encontrado');
  }

  const userObj = typeof (user as any).toObject === 'function' ? 
    (user as any).toObject() : user;
  const userResponse: any = {
    ...userObj,
    id: userObj._id?.toString() || userId
  };
  
  return userResponse;
}
```

**Qué hace:**
- Busca al usuario por ID en la base de datos
- Convierte el documento de MongoDB a objeto plano
- Agrega el campo `id` desde `_id` para compatibilidad con frontend
- La contraseña ya está excluida por `findById()`

#### refreshToken()
```typescript
async refreshToken(userId: string): Promise<{ access_token: string }> {
  const user = await this.usersService.findById(userId);
  
  if (!user) {
    throw new UnauthorizedException('Usuario no encontrado');
  }

  const userObj = typeof (user as any).toObject === 'function' ? 
    (user as any).toObject() : user;
  const payload = { correo: userObj.correo, sub: userObj._id || userId };
  
  return {
    access_token: this.jwtService.sign(payload),
  };
}
```

**Qué hace:**
- Verifica que el usuario exista
- Crea un payload con correo y ID del usuario
- Firma un nuevo JWT con 15 minutos de expiración
- Retorna el nuevo token

---

### 4. Schema de Comentarios con Campo "modificado" (publicacion.schema.ts)

**Archivo:** `red-social-backend/src/publicaciones/schemas/publicacion.schema.ts`

```typescript
@Prop({
  type: [{
    comentario: { type: String, required: true },
    autor: { type: MongooseSchema.Types.ObjectId, ref: 'User', required: true },
    fecha: { type: Date, default: Date.now },
    modificado: { type: Boolean, default: false }  // ⬅️ NUEVO CAMPO
  }],
  default: []
})
comentarios: {
  comentario: string;
  autor: MongooseSchema.Types.ObjectId;
  fecha: Date;
  modificado: boolean;  // ⬅️ NUEVO CAMPO
}[];
```

**Qué hace:**
- Agrega el campo `modificado` a cada comentario
- Por defecto es `false` cuando se crea un comentario
- Se pone en `true` cuando el comentario es editado
- Permite mostrar un badge "editado" en el frontend

---

### 5. Endpoints de Comentarios (publicaciones.controller.ts)

**Archivo:** `red-social-backend/src/publicaciones/publicaciones.controller.ts`

#### GET /publicaciones/:id/comentarios
```typescript
@Get(':id/comentarios')
async obtenerComentarios(
  @Param('id') id: string,
  @Query('offset') offset?: string,
  @Query('limit') limit?: string
) {
  return await this.publicacionesService.obtenerComentarios(id, offset, limit);
}
```

**Qué hace:**
- Obtiene comentarios de una publicación con **paginación**
- Query params opcionales: `offset` (inicio) y `limit` (cantidad)
- No requiere autenticación (endpoint público)

**Ejemplo de uso:**
```
GET /publicaciones/507f1f77bcf86cd799439011/comentarios?offset=0&limit=10
```

**Respuesta:**
```json
{
  "comentarios": [
    {
      "id": "507f191e810c19729de860ea",
      "comentario": "Excelente publicación!",
      "fecha": "2025-11-07T10:30:00.000Z",
      "modificado": false,
      "autor": {
        "id": "507f1f77bcf86cd799439011",
        "nombre": "Juan",
        "apellido": "Pérez",
        "nombreUsuario": "juanp",
        "imagenPerfil": "https://..."
      }
    }
  ],
  "total": 25,
  "offset": 0,
  "limit": 10
}
```

#### PUT /publicaciones/:id/comentarios/:comentarioId
```typescript
@UseGuards(JwtAuthGuard)
@Put(':id/comentarios/:comentarioId')
async editarComentario(
  @Param('id') publicacionId: string,
  @Param('comentarioId') comentarioId: string,
  @Body() editarComentarioDto: { texto: string },
  @Request() req
) {
  return await this.publicacionesService.editarComentario(
    publicacionId, 
    comentarioId, 
    editarComentarioDto.texto, 
    req.user.id
  );
}
```

**Qué hace:**
- Permite editar un comentario existente
- **Requiere autenticación** (JwtAuthGuard)
- Solo el autor del comentario puede editarlo
- Marca automáticamente `modificado: true`

**Body de la petición:**
```json
{
  "texto": "Comentario actualizado"
}
```

---

### 6. Lógica de Comentarios (publicaciones.service.ts)

**Archivo:** `red-social-backend/src/publicaciones/publicaciones.service.ts`

#### obtenerComentarios()
```typescript
async obtenerComentarios(publicacionId: string, offset?: string, limit?: string): Promise<any> {
  const publicacion = await this.publicacionModel
    .findById(publicacionId)
    .populate('comentarios.autor', 'nombre apellido nombreUsuario imagenPerfil')
    .exec();
  
  if (!publicacion || publicacion.eliminada) {
    throw new NotFoundException('Publicación no encontrada');
  }

  const offsetNum = offset ? parseInt(offset, 10) : 0;
  const limitNum = limit ? parseInt(limit, 10) : 10;

  // Ordenar por fecha descendente
  const comentariosOrdenados = [...publicacion.comentarios].sort((a: any, b: any) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  // Aplicar paginación
  const comentariosPaginados = comentariosOrdenados.slice(offsetNum, offsetNum + limitNum);

  return {
    comentarios: comentariosFormateados,
    total: publicacion.comentarios.length,
    offset: offsetNum,
    limit: limitNum
  };
}
```

**Qué hace:**
- Busca la publicación y popula los autores de comentarios
- Ordena comentarios por fecha **descendente** (más reciente primero)
- Aplica paginación con `offset` y `limit`
- Retorna comentarios formateados con metadata

#### editarComentario()
```typescript
async editarComentario(publicacionId: string, comentarioId: string, nuevoTexto: string, usuarioId: string): Promise<any> {
  const publicacion = await this.publicacionModel.findById(publicacionId);
  
  // Buscar el comentario
  const comentario = publicacion.comentarios.find((c: any) => 
    c._id.toString() === comentarioId
  );
  
  if (!comentario) {
    throw new NotFoundException('Comentario no encontrado');
  }

  // Verificar que el usuario sea el autor
  if (comentario.autor.toString() !== usuarioId) {
    throw new ForbiddenException('No tienes permisos para editar este comentario');
  }

  // Actualizar usando findIndex
  const comentarioIndex = publicacion.comentarios.findIndex((c: any) => 
    c._id.toString() === comentarioId
  );
  
  if (comentarioIndex !== -1) {
    (publicacion.comentarios[comentarioIndex] as any).comentario = nuevoTexto;
    (publicacion.comentarios[comentarioIndex] as any).modificado = true;  // ⬅️ Marcar como modificado
  }

  await publicacion.save();
  
  return comentarioFormateado;
}
```

**Qué hace:**
- Verifica que la publicación y el comentario existan
- **Valida que el usuario sea el autor** del comentario
- Actualiza el texto del comentario
- Marca `modificado: true` automáticamente
- Retorna el comentario actualizado con autor populado

---

## 🎨 Cambios en el Frontend

### 1. Componente de Detalle de Publicación

**Archivos:**
- `detalle-publicacion.component.ts`
- `detalle-publicacion.component.html`
- `detalle-publicacion.component.css`

**Ubicación:** `red-social-frontend/src/app/components/detalle-publicacion/`

**Qué hace:**
- Muestra una publicación completa con todos sus detalles
- Lista comentarios con paginación ("Cargar más")
- Permite agregar nuevos comentarios
- Permite editar comentarios propios
- Muestra badge "editado" cuando `modificado === true`

**Funcionalidades principales:**

```typescript
// Cargar publicación
cargarPublicacion(id: string): void {
  this.publicacionService.obtenerPorId(id).subscribe({
    next: (data: any) => {
      this.publicacion = data;
    }
  });
}

// Cargar comentarios con paginación
cargarComentarios(id: string, cargarMas: boolean = false): void {
  this.publicacionService.obtenerComentarios(id, this.offset, this.limit).subscribe({
    next: (data: any) => {
      if (cargarMas) {
        // Agregar a los existentes
        this.comentarios = [...this.comentarios, ...data.comentarios];
      } else {
        // Primera carga
        this.comentarios = data.comentarios;
      }
      this.totalComentarios = data.total;
    }
  });
}

// Editar comentario
guardarEdicion(comentarioId: string): void {
  this.publicacionService.editarComentario(
    this.publicacion.id, 
    comentarioId, 
    { texto: this.textoEditado }
  ).subscribe({
    next: (comentarioActualizado: any) => {
      // Actualizar en la lista
      const index = this.comentarios.findIndex(c => c.id === comentarioId);
      if (index !== -1) {
        this.comentarios[index] = comentarioActualizado;
      }
    }
  });
}
```

**HTML destacado:**
```html
<!-- Badge de "editado" -->
<span *ngIf="comentario.modificado" class="badge-editado">editado</span>

<!-- Botón "Cargar más" -->
<button 
  *ngIf="hayMasComentarios()" 
  (click)="cargarMasComentarios()"
  [disabled]="cargando"
>
  {{ cargando ? 'Cargando...' : 'Cargar más comentarios' }}
</button>
```

---

### 2. Servicio de Publicaciones Actualizado (publicacion.service.ts)

**Archivo:** `red-social-frontend/src/app/services/publicacion.service.ts`

**Nuevos métodos agregados:**

```typescript
// Obtener publicación por ID
obtenerPorId(publicacionId: string): Observable<Publicacion> {
  return this.http.get<Publicacion>(`${this.API_URL}/${publicacionId}`);
}

// Obtener comentarios paginados
obtenerComentarios(publicacionId: string, offset: number = 0, limit: number = 10): Observable<any> {
  const params = {
    offset: offset.toString(),
    limit: limit.toString()
  };
  return this.http.get<any>(`${this.API_URL}/${publicacionId}/comentarios`, { params });
}

// Editar comentario
editarComentario(publicacionId: string, comentarioId: string, datos: { texto: string }): Observable<Comentario> {
  return this.http.put<Comentario>(
    `${this.API_URL}/${publicacionId}/comentarios/${comentarioId}`, 
    datos, 
    { headers: this.getHeaders() }
  );
}
```

---

### 3. Servicio de Autenticación Mejorado (auth.service.ts)

**Archivo:** `red-social-frontend/src/app/services/auth.service.ts`

**Nuevos métodos:**

```typescript
// Validar token actual
autorizar(): Observable<User> {
  return this.http.post<User>(`${this.API_URL}/autorizar`, {}, {
    headers: {
      'Authorization': `Bearer ${this.getToken()}`
    }
  });
}

// Refrescar token
refrescarToken(): Observable<{ access_token: string }> {
  return this.http.post<{ access_token: string }>(`${this.API_URL}/refrescar`, {}, {
    headers: {
      'Authorization': `Bearer ${this.getToken()}`
    }
  }).pipe(
    tap(response => {
      if (response.access_token) {
        this.setLocalStorageItem('access_token', response.access_token);
      }
    })
  );
}
```

**Qué hace:**
- `autorizar()`: Valida el token actual con el backend
- `refrescarToken()`: Obtiene un nuevo token y lo guarda en localStorage

---

### 4. Servicio de Gestión de Sesiones (session.service.ts)

**Archivo:** `red-social-frontend/src/app/services/session.service.ts`

```typescript
export class SessionService {
  private readonly SESSION_WARNING_TIME = 10 * 60 * 1000; // 10 minutos
  private readonly TOKEN_EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutos
  
  public showWarningModal$ = new Subject<boolean>();

  iniciarMonitoreo(): void {
    this.lastActivityTime = Date.now();
    
    // Verificar cada minuto
    this.sessionTimer = interval(60000).subscribe(() => {
      const tiempoTranscurrido = Date.now() - this.lastActivityTime;

      if (tiempoTranscurrido >= this.SESSION_WARNING_TIME) {
        // Mostrar modal a los 10 minutos
        this.showWarningModal$.next(true);
      } else if (tiempoTranscurrido >= this.TOKEN_EXPIRATION_TIME) {
        // Cerrar sesión a los 15 minutos
        this.cerrarSesion();
      }
    });

    // Monitorear actividad del usuario
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
      window.addEventListener(event, () => this.resetearTimer());
    });
  }

  extenderSesion(): void {
    this.authService.refrescarToken().subscribe({
      next: () => {
        this.resetearTimer();
        this.showWarningModal$.next(false);
      },
      error: () => this.cerrarSesion()
    });
  }
}
```

**Qué hace:**
- Monitorea la actividad del usuario (clicks, teclas, scroll, mouse)
- **A los 10 minutos sin actividad**: Muestra modal de advertencia
- **A los 15 minutos**: Cierra sesión automáticamente
- Resetea el timer en cualquier interacción del usuario
- `extenderSesion()`: Llama a `/auth/refrescar` para obtener nuevo token

---

### 5. Modal de Advertencia de Sesión (session-modal.component.ts)

**Archivo:** `red-social-frontend/src/app/components/session-modal/session-modal.component.ts`

```typescript
export class SessionModalComponent implements OnInit {
  mostrarModal = false;

  ngOnInit(): void {
    this.sessionService.showWarningModal$.subscribe(show => {
      this.mostrarModal = show;
    });
  }

  extenderSesion(): void {
    this.sessionService.extenderSesion();
  }

  cerrarSesion(): void {
    this.sessionService.cerrarSesion();
  }
}
```

**Template:**
```html
<div *ngIf="mostrarModal" class="modal-overlay">
  <div class="modal">
    <h2>⚠️ Advertencia de Sesión</h2>
    <p>Tu sesión está por expirar. ¿Qué deseas hacer?</p>
    <button (click)="extenderSesion()">Extender Sesión</button>
    <button (click)="cerrarSesion()">Cerrar Sesión</button>
  </div>
</div>
```

**Qué hace:**
- Se muestra automáticamente a los 10 minutos
- Ofrece dos opciones al usuario:
  - **Extender Sesión**: Refresca el token y resetea el timer
  - **Cerrar Sesión**: Hace logout y redirige al login

---

### 6. Interceptor HTTP para Errores 401 (auth.interceptor.ts)

**Archivo:** `red-social-frontend/src/app/interceptors/auth.interceptor.ts`

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token inválido o expirado
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
```

**Qué hace:**
- Intercepta **todas las respuestas HTTP**
- Si detecta un error **401 Unauthorized**:
  - Cierra la sesión del usuario
  - Redirige automáticamente a `/login`
- Evita que el usuario se quede en páginas protegidas con token inválido

**Configuración en app.config.ts:**
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))  // ⬅️ Registrar interceptor
  ]
};
```

---

### 7. Componente Principal con Gestión de Sesión (app.ts)

**Archivo:** `red-social-frontend/src/app/app.ts`

```typescript
export class App implements OnInit {
  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Monitorear navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.authService.isAuthenticated()) {
        this.sessionService.iniciarMonitoreo();
      } else {
        this.sessionService.detenerMonitoreo();
      }
    });

    // Iniciar monitoreo inicial
    if (this.authService.isAuthenticated()) {
      this.sessionService.iniciarMonitoreo();
    }
  }
}
```

**Qué hace:**
- Inicia el monitoreo de sesión cuando el usuario está autenticado
- Detiene el monitoreo cuando no hay sesión activa
- Se ejecuta en cada cambio de ruta

**Template actualizado (app.html):**
```html
<router-outlet></router-outlet>
<app-session-modal></app-session-modal>  <!-- ⬅️ Modal global -->
```

---

### 8. Nueva Ruta para Detalle de Publicación (app.routes.ts)

**Archivo:** `red-social-frontend/src/app/app.routes.ts`

```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'publicaciones', component: PublicacionesComponent, canActivate: [AuthGuard] },
  { path: 'publicaciones/:id', component: DetallePublicacionComponent, canActivate: [AuthGuard] },  // ⬅️ NUEVA RUTA
  { path: 'perfil', component: MiPerfilComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
```

**Qué hace:**
- Agrega ruta dinámica `/publicaciones/:id`
- Protegida con `AuthGuard` (requiere login)
- El `:id` es el ID de la publicación a mostrar

---

## 🔄 Flujo de Autenticación

### 1. Login Inicial
```
Usuario ingresa credenciales
    ↓
Frontend → POST /auth/login
    ↓
Backend valida credenciales
    ↓
Backend genera JWT (exp: 15 min)
    ↓
Frontend guarda token en localStorage
    ↓
Frontend inicia monitoreo de sesión
```

### 2. Validación en cada Petición Protegida
```
Frontend hace petición
    ↓
Agrega header: Authorization: Bearer <token>
    ↓
Backend valida token con JwtAuthGuard
    ↓
Si válido → Procesa petición
Si inválido → Error 401
    ↓
Interceptor detecta 401 → Logout + Redirect a /login
```

### 3. Renovación de Token (Extender Sesión)
```
Han pasado 10 minutos
    ↓
SessionService muestra modal
    ↓
Usuario hace click en "Extender Sesión"
    ↓
Frontend → POST /auth/refrescar (con token actual)
    ↓
Backend valida token y genera uno nuevo
    ↓
Frontend guarda nuevo token
    ↓
Timer de sesión se resetea
```

---

## ⏱️ Gestión de Sesiones

### Línea de Tiempo de una Sesión

```
Minuto 0: Login → Token generado (expira en 15 min)
         ↓
Minuto 10: Modal de advertencia aparece
          ↓
          Opción A: "Extender Sesión"
                   → Nuevo token (expira en +15 min desde ahora)
                   → Timer se resetea a 0
          ↓
          Opción B: "Cerrar Sesión" o No hacer nada
                   → Logout inmediato (Opción B)
                   → Logout automático a los 15 min (si no hace nada)
```

### Eventos que Resetean el Timer

El timer de inactividad se resetea cuando el usuario realiza cualquiera de estas acciones:
- Click en cualquier parte
- Presiona una tecla
- Hace scroll
- Mueve el mouse

**Esto significa:**
- Si el usuario está activo, el modal aparecerá a los 10 minutos desde su **última interacción**
- No a los 10 minutos desde el login, sino desde su última actividad

---

## 💬 Sistema de Comentarios

### Funcionalidades Completas

#### 1. Ver Comentarios con Paginación
```
Usuario entra a /publicaciones/:id
    ↓
Se cargan primeros 10 comentarios (offset=0, limit=10)
    ↓
Ordenados por fecha descendente (más reciente primero)
    ↓
Si hay más, aparece botón "Cargar más"
    ↓
Click en "Cargar más" → offset += 10
    ↓
Nuevos comentarios se agregan a la lista existente
```

#### 2. Agregar Comentario
```
Usuario escribe en textarea
    ↓
Click en "Comentar"
    ↓
POST /publicaciones/:id/comentarios { comentario: "..." }
    ↓
Backend agrega comentario con modificado: false
    ↓
Frontend recarga lista de comentarios
```

#### 3. Editar Comentario Propio
```
Usuario ve botón ✏️ solo en sus propios comentarios
    ↓
Click en ✏️ → Textarea editable aparece
    ↓
Usuario modifica texto y hace click en "Guardar"
    ↓
PUT /publicaciones/:id/comentarios/:comentarioId { texto: "..." }
    ↓
Backend valida que usuario sea el autor
    ↓
Backend actualiza texto y marca modificado: true
    ↓
Frontend actualiza comentario en la lista
    ↓
Badge "editado" aparece automáticamente
```

---

## 🎯 Resumen de Endpoints

### Autenticación

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login de usuario |
| POST | `/auth/registro` | No | Registro de usuario |
| POST | `/auth/autorizar` | ✅ | Validar token actual |
| POST | `/auth/refrescar` | ✅ | Obtener nuevo token |

### Publicaciones

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/publicaciones` | No | Listar publicaciones |
| GET | `/publicaciones/:id` | No | Ver publicación específica |
| POST | `/publicaciones` | ✅ | Crear publicación |
| DELETE | `/publicaciones/:id` | ✅ | Eliminar publicación |

### Comentarios

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/publicaciones/:id/comentarios` | No | Listar comentarios (paginado) |
| POST | `/publicaciones/:id/comentarios` | ✅ | Agregar comentario |
| PUT | `/publicaciones/:id/comentarios/:id` | ✅ | Editar comentario |

---

## 🔒 Seguridad Implementada

### Nivel Backend
- ✅ Tokens JWT de **corta duración** (15 minutos)
- ✅ JwtAuthGuard en endpoints sensibles
- ✅ Validación de permisos (solo autor puede editar comentario)
- ✅ Contraseñas nunca se devuelven en respuestas
- ✅ Validación de usuario existente antes de refrescar token

### Nivel Frontend
- ✅ AuthGuard en rutas protegidas
- ✅ Interceptor para errores 401
- ✅ Tokens guardados en localStorage (Browser only)
- ✅ Logout automático en token expirado
- ✅ Monitoreo de sesión con advertencias

---

## 📝 Notas Importantes

### Para Desarrollo
1. **Tiempo de expiración de token**: Configurado a 15 minutos en producción. Para desarrollo puedes aumentarlo temporalmente en `auth.module.ts`.

2. **Modal de sesión**: Aparece a los 10 minutos de inactividad. Esto se puede ajustar en `session.service.ts` cambiando `SESSION_WARNING_TIME`.

3. **Paginación de comentarios**: Por defecto carga 10 comentarios a la vez. Puedes ajustar esto cambiando el `limit` en `detalle-publicacion.component.ts`.

### Para Producción
1. Asegúrate de tener configurado HTTPS para proteger los tokens en tránsito
2. Considera implementar refresh tokens (tokens de larga duración) para mejorar UX
3. Implementa rate limiting en endpoints de autenticación
4. Considera usar HttpOnly cookies en lugar de localStorage para tokens

---

## 🚀 Cómo Probar

### Probar Gestión de Sesión
1. Hacer login
2. Esperar 10 minutos sin interactuar
3. Debería aparecer el modal de advertencia
4. Probar ambas opciones:
   - "Extender Sesión" → Token se renueva
   - "Cerrar Sesión" → Redirige a login

### Probar Comentarios
1. Ir a cualquier publicación (`/publicaciones/:id`)
2. Ver lista de comentarios
3. Agregar un comentario nuevo
4. Editar tu propio comentario (aparece lápiz ✏️)
5. Verificar que aparezca el badge "editado"
6. Si hay más de 10 comentarios, probar "Cargar más"

### Probar Interceptor 401
1. Modificar manualmente el token en localStorage (hacerlo inválido)
2. Intentar hacer cualquier petición protegida
3. Debería redirigir automáticamente a `/login`

---

## 👨‍💻 Autor
**Documentación del Sprint #3**  
Fecha: Noviembre 7, 2025  
Versión: 1.0
