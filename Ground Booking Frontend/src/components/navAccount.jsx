import React from 'react'
import styled from 'styled-components'
import { FaUser } from 'react-icons/fa';
import userProfile from '../assets/userProfile.png'

const AccountBox=styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-size: contain;
    background-repeat: no-repeat;
    color: whitesmoke;
    font-size: 22px;
    font-weight: 600;
    display: flex;
    justify-content: center;
    place-items: center;
    cursor: pointer;
`;

export default function NavAccount() {

    const url=`url("${localStorage.getItem("profileImage")}")`;  

    return (
        <div>
            {localStorage.getItem("userId") ? 
            (localStorage.getItem("profileImage")!='undefined' 
            ? <AccountBox style={{backgroundImage: url}}/> 
            : <AccountBox style={{backgroundImage: `url(${userProfile})`}}/>) 
            : 
            <AccountBox><FaUser /></AccountBox>}
        </div>  
    );
}
