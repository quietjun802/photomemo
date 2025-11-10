import React, { useEffect, useState, useCallback } from 'react'
import AdminUserFilter from '../../components/admin/AdminUserFilter'
import AdminUserList from '../../components/admin/AdminUserList'
import { patchAdminUser, fetchAdminUsers } from '../../api/adminApi'
import useAdminFiltered from '../../hooks/useAdminFiltered'

const AdminUsers = () => {

  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState({
    q: "",
    user: "",
    status: "",
  });

  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    size: 20,
    totalPages: 1,
  });

  const getUsers = useCallback(async (page = 1, size = 20) => {
    const res = await fetchAdminUsers({ page, size })

    setUsers(res.items)
    setMeta({
      total: res.total,
      page: res.page,
      sies: res.size,
      totalPage: res.totalPages
    })
  }, [])

  useEffect(() => {
    getUsers(1, 20)
  }, [getUsers])

  const toggleUserLock = async (UserId, currentStatus) => {
    const newStatus = !currentStatus

    await patchAdminUser(UserId, { isActive: newStatus })

    alert(`계정이 ${newStatus ? "활성화" : "비활성화"}되었습니다.`)
    await getUsers(meta.page, meta.size)
  }

  const changeUserRole = async (UserId, currentRole) => {
    const newRole = !currentRole === 'admin' ? 'user' : 'admin'

    await patchAdminUser(UserId, { role: newRole })

    alert(`권한이 ${currentRole}에서 ${newRole}로 변경되었습니다.`)
    await getUsers(meta.page, meta.size)
  }

  const filteredUsers = useAdminFiltered(users, filter, {
    q: "email",
    user: "_id",
    status: "isActive"
  })

  return (
    <div>
      <AdminUserFilter
        filterValue={filter}
        onFilterChange={setFilter}
        meta={meta}
      />
      <AdminUserList
        items={filteredUsers}
        onChangeLock={toggleUserLock}
        onChangeRole={changeUserRole}
      />
    </div>
  )
}

export default AdminUsers