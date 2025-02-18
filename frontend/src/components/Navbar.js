import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Disclosure, DisclosureButton, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
const user = {
    name: 'Tom Cook',
    email: 'tom@example.com',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};
const navigation = [
    { name: '전체보기', href: '/', current: true },
    { name: '잡코리아', href: '#', current: false },
    { name: '점핏', href: '#', current: false },
    { name: 'Calendar', href: '#', current: false },
    { name: 'Reports', href: '#', current: false },
];
const userNavigation = [
    { name: 'Your Profile', href: '#' },
    { name: 'Settings', href: '#' },
    { name: 'Sign out', href: '#' },
];
function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
export default function Navbar() {
    return (_jsx(Disclosure, { as: "nav", className: "bg-gray-800", children: _jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex h-16 items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "shrink-0", children: _jsx("img", { alt: "Your Company", src: "https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500", className: "size-8" }) }), _jsx("div", { className: "hidden md:block", children: _jsx("div", { className: "ml-10 flex items-baseline space-x-4", children: navigation.map((item) => (_jsx("a", { href: item.href, className: classNames(item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'rounded-md px-3 py-2 text-sm font-medium'), children: item.name }, item.name))) }) })] }), _jsx("div", { className: "hidden md:block", children: _jsxs("div", { className: "ml-4 flex items-center md:ml-6", children: [_jsxs("button", { type: "button", className: "relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800", children: [_jsx("span", { className: "sr-only", children: "View notifications" }), _jsx(BellIcon, { "aria-hidden": "true", className: "size-6" })] }), _jsxs(Menu, { as: "div", className: "relative ml-3", children: [_jsx("div", { children: _jsxs(MenuButton, { className: "relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800", children: [_jsx("span", { className: "sr-only", children: "Open user menu" }), _jsx("img", { alt: "", src: user.imageUrl, className: "size-8 rounded-full" })] }) }), _jsx(MenuItems, { className: "absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5", children: userNavigation.map((item) => (_jsx(MenuItem, { children: _jsx("a", { href: item.href, className: "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", children: item.name }) }, item.name))) })] })] }) }), _jsx("div", { className: "-mr-2 flex md:hidden", children: _jsxs(DisclosureButton, { className: "relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white", children: [_jsx("span", { className: "sr-only", children: "Open main menu" }), _jsx(Bars3Icon, { className: "block size-6", "aria-hidden": "true" }), _jsx(XMarkIcon, { className: "hidden size-6", "aria-hidden": "true" })] }) })] }) }) }));
}
