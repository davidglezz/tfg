import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { Errors } from '../shared';
// import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  providers: []
})
export class AuthComponent implements OnInit {
  authType: String = '';
  title: String = '';
  // errors: Errors = new Errors();
  isSubmitting = false;
  authForm: FormGroup;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    /*private authService: AuthService*/) {
    this.authForm = this.fb.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required],
    });
  }

  submitForm() {
    this.isSubmitting = true;
    // this.errors = new Errors();
    const credentials = this.authForm.value;
    if (this.authType === 'login') {
      this.login(credentials);
    } else {
      this.register(credentials);
    }
  }

  register(credentials: any) {
    /*this.authService.register(credentials)
      .catch((error) => {
        console.error('Registration error', error);
      })
      .then((result) => {
        this.login(credentials);
      });*/
  }

  login(credentials: any) {
    /*this.authService.login(credentials)
      .catch((error) => {
        console.error('Login error', error);
      })
      .then((result) => {
        this.router.navigateByUrl('/');
      });*/
  }

  ngOnInit() {
    this.route.url.subscribe(data => {
      this.authType = data[data.length - 1].path;
      this.title = (this.authType === 'login') ? 'Login' : 'Subscribe';
      if (this.authType === 'register') {
        this.authForm.addControl('email', new FormControl('', Validators.required));
      }
    });
  }

}
