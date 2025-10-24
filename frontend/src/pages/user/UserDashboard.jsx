import React from 'react'
import FileList from './FileList'
import UploadForm from './UploadForm'
import "./style/UserDashboard.scss"
import { useState } from 'react'

const UserDashboard = () => {
    const [search, setSearch] = useState("")
    const [open, setOpen] = useState(false)
    return (
        <section>
            <div className="inner">
                <div className="search-wrap">
                    <input
                        type="text"
                        placeholder='검색어를 입력하세요'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        className='btn primary'
                        onClick={() => setOpen(true)}
                    >업로드</button>
                </div>
            </div>
            <div className="inner">
                {open && (
                    <UploadForm open={open} onClose={() => setOpen(false)} />
                )}
                <FileList />
            </div>
        </section>
    )
}

export default UserDashboard