import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publicacion, Comentario } from '../models/publicacion.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {
  private readonly API_URL = 'http://localhost:3000/publicaciones';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getPublicaciones(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(this.API_URL);
  }

  crearPublicacion(publicacion: Omit<Publicacion, 'id' | 'fechaCreacion' | 'likes' | 'comentarios'> | FormData): Observable<Publicacion> {
    // Si es FormData, no enviamos Content-Type header (lo maneja automáticamente el navegador)
    const headers = publicacion instanceof FormData ? 
      new HttpHeaders({ 'Authorization': this.authService.getToken() ? `Bearer ${this.authService.getToken()}` : '' }) :
      this.getHeaders();
    
    return this.http.post<Publicacion>(this.API_URL, publicacion, { headers });
  }

  darLike(publicacionId: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.API_URL}/${publicacionId}/like`, {}, { headers: this.getHeaders() });
  }

  agregarComentario(publicacionId: string, comentario: { comentario: string }): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.API_URL}/${publicacionId}/comentarios`, comentario, { headers: this.getHeaders() });
  }
}