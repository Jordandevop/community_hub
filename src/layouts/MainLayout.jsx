import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { useEffect } from "react";

function MainLayout(){
    const { mode } = useSelector((state) => state.theme);
    useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", mode);
  }, [mode]);

    return(
        <>
         <Navbar/>
        <Container className="py-4">
            <Outlet/>

        </Container>
        </>
       
    )
}

export default MainLayout;