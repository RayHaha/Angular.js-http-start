import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType } from '@angular/common/http';
import { Post } from './post.model';
import { map, catchError, tap } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostsService{

    error = new Subject<string>();

    constructor(private http: HttpClient){

    }

    createAndStorePost(title: string, content: string){
        const postData: Post = {title: title, content: content};
        this.http
        .post<{ name: string }>(
          'https://ng-complete-guide-d26fc.firebaseio.com/posts.json',
          postData,{
              observe: 'response'   // response the full http response object
          }
        )
        .subscribe(responseData => {
          console.log(responseData);
        }, error => {
            this.error.next(error.message);
        });
    }

    fetchPosts(){
        let searchParams = new HttpParams();
        searchParams = searchParams.append('print','pretty');
        searchParams = searchParams.append('custom','key');

        // get<type> is the same way to assign type at responseData: type but handle by Angular
        return this.http.get<{ [key: string]: Post }>('https://ng-complete-guide-d26fc.firebaseio.com/posts.json',
        {
            headers: new HttpHeaders({ 'Custom-Header': 'Hello' }),
            /*params: new HttpParams().set('print', 'pretty')*/
            params: searchParams,
            responseType: 'json'
        })
        .pipe(
        map(
            responseData => {
            const postsArray: Post[] = [];
            for(const key in responseData){
                if(responseData.hasOwnProperty(key)){
                postsArray.push({ ...responseData[key], id: key });
                }
            }
            return postsArray;
            }
        ), catchError(errorRes => {
            // send to analytics server or somethings you need to handle 
            return throwError(errorRes);
        })
        )
    }

    deletePost(){
        return this.http.delete('https://ng-complete-guide-d26fc.firebaseio.com/posts.json', {
            observe: 'events',
            responseType: 'text'
        })
        .pipe(
            tap(event => {
                console.log(event);
                if(event.type === HttpEventType.Sent){
                    // maybe something loading...
                }
                if(event.type === HttpEventType.Response){
                    console.log(event.body);
                }
            })
        );
    }


}