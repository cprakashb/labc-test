import { Button, Navbar, NavbarBrand } from "flowbite-react";
import Image from "next/image";

export function Header() {
    return (
        <Navbar fluid className="bg-gray-900">
            <NavbarBrand href="/posts">
                <Image
                    src="https://www.leg.bc.ca/sites/default/files/LABC%20Logo.png"
                    className="h-9 w-70"
                    alt="BC Legislature Logo"
                    width={484}
                    height={60}
                />

            </NavbarBrand>
            <div className="flex md:order-2">
                <Button as="a" href="https://chandraprakash.dev/" target="_blank" rel="noopener noreferrer" color="light">
                    View Portfolio
                </Button>
            </div>
        </Navbar>
    );
}
