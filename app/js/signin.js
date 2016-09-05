var $login = jQuery('#login');
var $signup = jQuery('#signup');
var $loginSignupForm = jQuery('.signinlogin');

function signupForm(){
	console.log('clicked signup');
	$loginSignupForm.html("");
	$loginSignupForm.append(
		`<h1 class="text-center">Sign Up</h1>
		<form action="/chat.html" class="signup">
			<div class="form-group">
				<label>User Name</label>
				<div class="input-group">
					<span class="input-group-addon">
						<i class="glyphicon glyphicon-user"></i>
					</span>
					<input type="text" name="name" class="form-control"/>
				</div>
				<label>Email</label>
				<div class="input-group">
					<span class="input-group-addon">
						<i class="glyphicon glyphicon-envelope"></i>
					</span>
					<input type="text" name="email" class="form-control"/>
				</div>
				<label>Password</label>
				<div class="input-group">
					<span class="input-group-addon">
						<i class="glyphicon glyphicon-lock"></i>
					</span>
					<input type="text" name="password" class="form-control"/>
				</div>
			</div>
			<div class="input-group">
				<span class="input-group-addon" id="basic-addon1">
					<i class="glyphicon glyphicon-log-in"></i>
				</span>
				<input type="submit" value="Sign Up" class="btn btn-primary btn-block form-control" aria-describedby="basic-addon1"/>
				
			</div>
		</form>`
	);
};

function loginForm(){
	console.log('clicked login');
	$loginSignupForm.html("");
	$loginSignupForm.append(
		`<h1 class="text-center">Log In</h1>
		<form action="/chat.html" class="login">
			<div class="form-group">
				<label>User Name</label>
				<div class="input-group">
					<span class="input-group-addon">
						<i class="glyphicon glyphicon-user"></i>
					</span>
					<input type="text" name="name" class="form-control"/>
				</div>
				<label>Password</label>
				<div class="input-group">
					<span class="input-group-addon">
						<i class="glyphicon glyphicon-lock"></i>
					</span>
					<input type="text" name="password" class="form-control"/>
				</div>
			</div>
			<div class="input-group">
				<span class="input-group-addon" id="basic-addon1">
					<i class="glyphicon glyphicon-log-in"></i>
				</span>
				<input type="submit" value="Sign Up" class="btn btn-primary btn-block form-control" aria-describedby="basic-addon1"/>
				
			</div>
		</form>`
	);
};

$signup.on('click', signupForm);

$login.on('click', loginForm);