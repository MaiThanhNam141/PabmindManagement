import React from 'react';
import '../style/NotFound.css'
import '../style/Login.css'
import { Link } from "react-router-dom";
import astronaut from "../assets/astronaut.svg";
import blackhole from "../assets/blackhole.png";

const NotFound = () => {
    return (
        <div class="denied__wrapper">
            <h1>404</h1>
            <h3>Bạn đã trôi lạc vào không gian vũ trụ, hmmm có vẻ như trang này không tồn tại.</h3>
            <img id="astronaut" src={astronaut} />
            <img id="planet" src={blackhole} />
            <Link to="/" >
                <button class="btn" >Trang chủ</button>
            </Link>
        </div>
    );
};

export default NotFound;
