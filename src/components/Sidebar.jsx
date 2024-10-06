"use client"
import React, { createContext, useContext, useState } from 'react'
import Image from 'next/image'
import {TbChevronLeftPipe, TbChevronRightPipe} from 'react-icons/tb'
import {FiMoreVertical,FiSettings} from 'react-icons/fi'
import {RxDashboard} from 'react-icons/rx'
import {BsMusicNoteList,BsMailbox, BsCloudUpload, BsCalendarDate} from 'react-icons/bs'
import {PiUsersThreeDuotone} from 'react-icons/pi'
import {CiStreamOn} from 'react-icons/ci'
import {GiLoveSong} from 'react-icons/gi'
import {MdPlaylistAdd,MdOutlineLogout,MdOutlineAdminPanelSettings} from 'react-icons/md'
import {LiaAdSolid} from 'react-icons/lia'
import { usePathname } from 'next/navigation';
import Link from 'next/link'
import {logout} from '@/redux/action/user';
import {useDispatch,useSelector} from 'react-redux';
import {GiMusicalScore} from 'react-icons/gi'
import {toast} from 'react-toastify';
import { current } from '@reduxjs/toolkit'


function isToday(year,month,date){
    const Currntdate = new Date();
    if(+year == Currntdate.getFullYear() && +month == Currntdate.getMonth()+1 && +date == Currntdate.getDate()){
        return true;
    }else{
        return false;
    }
}


function checkInTimeRange(startTime,endTime,date){
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    // check date 
    const [userYear,userMonth,userDate] = date?.split('-');
  

    const rangeStartHour = +startTime?.split(':')[0];
    const rangeStartMinute = +startTime?.split(':')[1];

    const rangeEndHour = +endTime?.split(':')[0];
    const rangeEndMinute = +endTime?.split(':')[1];

    const timeInRange = (currentHour > rangeStartHour || (currentHour === rangeStartHour && currentMinute >= rangeStartMinute)) && (currentHour < rangeEndHour || (currentHour === rangeEndHour && currentMinute <= rangeEndMinute));

    console.log('range',timeInRange)

    if(isToday(userYear,userMonth,userDate) && timeInRange){
        return true;
    }else{
        return false;
    }
    // return timeInRange;
}


function checkInTimeRangeForDay(startTime,endTime,user){
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
  

    const rangeStartHour = +startTime?.split(':')[0];
    const rangeStartMinute = +startTime?.split(':')[1];

    const rangeEndHour = +endTime?.split(':')[0];
    const rangeEndMinute = +endTime?.split(':')[1];

    const timeInRange = (currentHour > rangeStartHour || (currentHour === rangeStartHour && currentMinute >= rangeStartMinute)) && (currentHour < rangeEndHour || (currentHour === rangeEndHour && currentMinute <= rangeEndMinute));

    const checkDay = user?.djDays?.includes((new Date().getDay()).toString())
    if(checkDay && timeInRange){
        return true;
    }else{
        return false;
    }
    // return timeInRange;
}


const SidebarContext = createContext();

export const SidebarBody = ({children}) => {
    const [expanded, setExpanded] = useState(true);
    const {user} = useSelector(store => store.user);
  return (
    <aside className='h-screen'>
        <nav className='h-full flex flex-col bg-white border-r shadow-sm'>
            <div className='p-4 pb-2 flex justify-between items-center'>
                <Image src={'/images/logo.svg'} className={`
                    overflow-hidden transition-all
                    ${expanded ? "block w-28": "w-0 hidden"}
                 `} width={100} height={100}/>
                <button className={`p-1.5 rounded-lg bg-green-50 hover:bg-green-100 ${expanded ? "ml-0": "ml-2"}`} onClick={() => setExpanded(!expanded)}>
                    {expanded ? <TbChevronLeftPipe size={30}/> : <TbChevronRightPipe size={30}/> }
                </button>
            </div>

            <SidebarContext.Provider value={{expanded}}>
                <ul className='flex-1 px-3 py-6 overflow-y-auto overflow-x-hidden'>
                {children}
                </ul>
            </SidebarContext.Provider>

            <div className='border-r flex p-3 justify-between items-center'>
                <Image src={'/vercel.svg'} className='w-14 h-14 rounded-md' width={102} height={100}/>
                <div className={`flex justify-center items-center
                overflow-hidden transition-all
                ${expanded ? "w-52 ml-3": "w-0"}
                `}>
                    <div>
                        <h4 className='font-semibold'>{user?.name}</h4>
                        <span className='text-xs text-gray-600'>{user?.email}</span>
                    </div>
                    
                </div>
                {expanded && <FiMoreVertical side={60}/>}
                
            </div>

        </nav>
    </aside>
  )
}


export function SidebarItem({icon,text,active,alert,link='/',onClick,desc}){
    const {expanded} = useContext(SidebarContext);
    return(<>
        <li onClick={onClick}>
            <Link href={link} className={` 
                relative flex items-center py-2 px-3 my-1
                font-medium rounded-md cursor-pointer
                transition-colors
                ${
                    active ?
                    "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                    :"hover:bg-indigo-50 text-gray-600"
                }
            `}>
                {icon}
                <span className={`overflow-hidden transition-all flex justify-between items-center ${
                    expanded ? "w-52 ml-3": "w-0"
                }`}>{text} <button className='text-sm w-4 h-4 rounded-full bg-gray-300 text-gray-800' title={desc}>?</button></span>
                {
                    alert && (
                        <div className={`absolute right-2 w-2 h-2 rounded-full bg-indigo-400 ${
                            expanded ? "": "top-2"
                        }`}/>
                    )
                }

                {
                    !expanded && <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100`}>
                        {text}
                    </div>
                }
            </Link>
        </li>
    </>);

}

export default function Sidebar(){
    const pathname = usePathname();
    const dispatch = useDispatch();
    const {user} = useSelector(store => store.user);
    const handleLogout = async () => {
        dispatch(logout());
    }

    const isAllow = (permissionName) => {
        if(user?.isDJ){
            if(user?.djPermissions.includes(permissionName)){
                if(permissionName === 'live'){
                    if(user?.djTimeInDays){
                        return checkInTimeRangeForDay(user?.djStartTime,user?.djEndTime,user);
                    }else{
                        const isTimeRange = checkInTimeRange(user?.djStartTime,user?.djEndTime,user?.djDate);
                        return isTimeRange;
                    }
                    
                }else{
                    return true
                }   
            }else{
               return false
            }
        }else{
            if(permissionName === 'playlists'){
                return false
            }else{
                return true
            } 
        }
    }


    const navigationsItems = [
        {
            icon: <RxDashboard size={30}/>,
            text: "Dashboard",
            alert: false,
            active: pathname == '/dashboard',
            link: '/dashboard',
            show: isAllow('dashboard'),
            desc: "overview of channel"
        },
        {
            icon: <BsCloudUpload size={30}/>,
            text:  `${user?.isDJ ? 'DJ' : 'Admin'} Uploads Song`,
            alert: false,
            active: pathname == '/dashboard/songs/upload',
            link: '/dashboard/songs/upload',
            show: isAllow('songs'),
            desc: "You are able to upload your songs"
    
        },
        {
            icon: <GiLoveSong size={30}/>,
            text: `${user?.isDJ ? 'DJ' : 'Admin'} Uploaded Songs`,
            alert: false,
            active: pathname == '/dashboard/songs',
            link: '/dashboard/songs',
            show: true,
            desc: "All your uploaded songs will display here"
        },
        {
            icon: <MdPlaylistAdd size={30}/>,
            text: `${user?.isDJ ? 'DJ' : 'Admin'} Create Playlist`,
            alert: false,
            active: pathname == '/dashboard/playlist-create',
            link: '/dashboard/playlist-create',
            show: true,
            desc: "You are able to add your songs in the form of playlist to arrange them well"
    
        },
        {
            icon: <BsMusicNoteList size={30}/>,
            text: `${user?.isDJ ? 'DJ' : 'Admin'}  Created Playlists`,
            alert: false,
            active: pathname == '/dashboard/playlist',
            link: '/dashboard/playlist',
            show: true,
            desc: "All your created playlists will display here"
        },
        {
            icon: <MdOutlineAdminPanelSettings size={30}/>,
            text: "Admin Playlists",
            alert: false,
            active: pathname == '/dashboard/playlist-admin',
            link: '/dashboard/playlist-admin',
            show: isAllow('playlists'),
            desc: "You are able to copy admin playlists"
    
        },
       
        
        {
            icon: <BsCalendarDate size={30}/>,
            text: "Schedules",
            alert: false,
            active: pathname == '/dashboard/shedules',
            link: '/dashboard/shedules',
            show: isAllow("schedules"),
            desc: "You are able to create schedules"
        },
        {
            icon: <PiUsersThreeDuotone size={30}/>,
            text: "My DJ Team",
            alert: false,
            active: pathname == '/dashboard/team',
            link: '/dashboard/team',
            show: isAllow('team'),
            desc: "Admin is able to add djs from here and to assign time and date to djs"
        },
        {
            icon: <LiaAdSolid size={30}/>,
            text: "Ads Jingles",
            alert: false,
            active: pathname == '/dashboard/ads',
            link: '/dashboard/ads',
            show: isAllow('ads'),
            desc: "You is able to add Ads Jingles"
        },
        {
            icon: <GiMusicalScore size={30}/>,
            text: "Manage Filter Effects",
            alert: false,
            active: pathname == '/dashboard/filter',
            link: '/dashboard/filter',
            show: true,
            desc: "Admin is able to add Filter effects"
        },
        {
            icon: <BsMailbox size={30}/>,
            text: "Manage Live Playlist",
            alert: true,
            active: pathname == '/dashboard/manage-live',
            link: '/dashboard/manage-live',
            show: true,
            desc: "You can create a playlist before going to live which will be shown to during streaming"
        },
        {
            icon: <CiStreamOn size={30}/>,
            text: "Start Streaming",
            alert: false,
            active: pathname == '/dashboard/go-live',
            link: '/dashboard/go-live',
            show: isAllow("live"),
            desc: "You are able to streaming"
        },
        {
            icon: <FiSettings size={30}/>,
            text: "Welcome Tone",
            alert: false,
            active: pathname == '/dashboard/welcome-tone',
            link: '/dashboard/welcome-tone',
            show: true,
            desc: "You can create own welcome tone"
        },
        {
            icon: <FiSettings size={30}/>,
            text: "Ending Tone",
            alert: false,
            active: pathname == '/dashboard/ending-tone',
            link: '/dashboard/ending-tone',
            show: true,
            desc: "You can create own ending tone"
        },
        
    ]
    return<>
    <SidebarBody>
        {
            navigationsItems.map((data) => data.show ? <SidebarItem {...data}/> :<HideLink {...data}/>)
        }

        <SidebarItem icon={<MdOutlineLogout size={30}/>} text={'Logout'} alert={false} link={''} active={false} onClick={handleLogout}/>
    </SidebarBody>
    </>
}
const daysObject = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday"
};




function HideLink({show,text,active,alert,icon}){

    const {expanded} = useContext(SidebarContext);
    const {user} = useSelector(store => store.user);
    function handleClick(){
        if(user?.djTimeInDays){
            toast.info(`You can start streaming only ${user?.djDays?.map((p,i) => `${i != 0 ? ' ,' : ' '} ${daysObject[p]}`)}`,{
                position: "top-center"
            });
        }else{
            toast.info(`You can start streaming only ${user?.djStartTime} to ${user?.djEndTime}`,{
                position: "top-center"
            });
        }
        
    }

    return(
        <>
            {
                text === "Start Streaming" &&
                <li onClick={handleClick}>
                    <button className={` 
                        relative flex items-center py-2 px-3 my-1
                        font-medium rounded-md
                        transition-colors
                        text-gray-300 cursor-[not-allowed]
                        ${
                            active ?
                            "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                            :"hover:bg-gray-50 text-gray-300"
                        }
                    `}>
                        {icon}
                        <span className={`overflow-hidden transition-all ${
                            expanded ? "w-52 ml-3": "w-0"
                        }`}>{user.djTimeInDays ? `${user?.djDays?.map((p,i) => `${i != 0 ? ' ,' : ' '} ${daysObject[p]} ${user.djStartTime}-${user?.djEndTime}`)}`: `${user.djDate} / ${user.djStartTime}-${user?.djEndTime}`}</span>
                        {
                            alert && (
                                <div className={`absolute right-2 w-2 h-2 rounded-full bg-indigo-400 ${
                                    expanded ? "": "top-2"
                                }`}/>
                            )
                        }

                        {
                            !expanded && <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100`}>
                                {text}
                            </div>
                        }
                    </button>
                </li>
            }
        </>
    )

   
}
