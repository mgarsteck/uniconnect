import React from 'react'
import { Link } from 'react-router-dom'

const Landing = () => {
    return (
        <div className="">
            
            <h1>
                Landing page
            </h1>
            <div className="layout-center card-deck">
                
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Login</h5>
                        <form>
                            <div class="form-group">
                                <label for="exampleInputEmail1">Email address</label>
                                <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
                                <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                            </div>
                            <div class="form-group">
                                <label for="exampleInputPassword1">Password</label>
                                <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" />
                            </div>
                            <button type="submit" class="btn btn-warning">Submit</button>
                        </form>
                    </div>
                    <div className="card-footer text-muted">Login with your Telegram or Stellar credentials</div>
                </div>
            
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Register</h5>
                        <form>
                            <div class="form-group">
                                <label for="exampleInputEmail1">Email address</label>
                                <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
                                <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                            </div>
                            <div class="form-group">
                                <label for="exampleInputPassword1">Password</label>
                                <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" />
                            </div>
                            <button type="submit" class="btn btn-warning">Submit</button>
                        </form>
                    </div>
                    <div className="card-footer text-muted">Register with your Telegram or Stellar Wallet!</div>
                </div>
                
            </div>
            
        </div>
    )
}

export default Landing
