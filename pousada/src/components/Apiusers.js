import React from "react";
import axios from 'axios';
import User from "./Users";
import { useState,  useEffect, } from "react";

import {Button} from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";



export default function Apiusers() {
const  [user, setUser] = useState([]);
const [count,setCount] = useState(0);


 useEffect(() => {
    axios.get('http://localhost:8080/users')
    .then(response => setUser(response.data));
 }, []);
 
return ( 
 <>
<div className="p-8">
{user.map(item => (
        
        <p key={item.id}>{item.name}</p>
      
        
      
      ))}


<div className="text-center">
            <Button label="Click" icon="pi pi-plus" onClick={e => setCount(count + 1)}></Button>
            <div className="text-2xl text-900 mt-3">{count}</div>
        </div>

</div>
 </>
  );
    
}
