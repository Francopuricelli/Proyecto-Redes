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

  crearPublicacion(publicacion: Omit<Publicacion, 'id' | 'fechaCreacion' | 'likes' | 'comentarios'>): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.API_URL, publicacion, { headers: this.getHeaders() });
  }

  darLike(publicacionId: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.API_URL}/${publicacionId}/like`, {}, { headers: this.getHeaders() });
  }

  agregarComentario(publicacionId: string, comentario: { comentario: string }): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.API_URL}/${publicacionId}/comentarios`, comentario, { headers: this.getHeaders() });
  }
}