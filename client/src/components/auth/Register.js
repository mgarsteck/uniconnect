import React, { Fragment, useState } from 'react'

const Register = () => {
    return (
        <Fragment>
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">Register</h5>
                <form>
                    <div class="form-group">
                        <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
                        <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                    </div>
                    <div class="form-group">
                        <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" />
                    </div>
                    <button type="submit" class="btn btn-warning">Submit</button>
                </form>
            </div>
            <div className="card-footer text-muted">Register with your Telegram or Stellar credentials</div>
        </div>
        </Fragment>
    )
}

export default Register
