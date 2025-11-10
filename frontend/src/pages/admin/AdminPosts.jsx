import React, { useEffect, useMemo, useState, useCallback } from "react";
import { fetchAdminPosts, patchAdminPost } from "../../api/adminApi";
import AdminPostList from "../../components/admin/AdminPostsList";
import AdminPostFilter from "../../components/admin/AdminPostFilter";
import { getUserId } from "../../util/getUserId";
import useAdminFiltered from "../../hooks/useAdminFiltered";

const AdminPosts = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState({
    page: 1,
    size: 10,
    status: "",
    q: "",
    user: "",
  });

  const getPosts = useCallback(async () => {
    const res = await fetchAdminPosts();
    setItems(res)
  }, [])

  useEffect(() => { getPosts() }, [getPosts]);

  const normalizedItems = useMemo(
    () => items.map(it => ({ ...it, _userId: getUserId(it.user) })),
    [items]
  )

  const filteredItem = useAdminFiltered(normalizedItems, filter, {
    q: 'title',
    user: '_userId',
    status: 'status'
  })

  const handleApprove = async (id) => {
    const updated = await patchAdminPost(id, { status: "approved" })
    setItems(prev => prev.map(it => (it._id === id ? updated : it)))
  }

  const handleReject = async (id) => {
    const updated = await patchAdminPost(id, { status: "rejected" })
    setItems(prev => prev.map(it => (it._id === id ? updated : it)))
  }

  return (
    <div className="inner">
      <AdminPostFilter value={filter} onChange={setFilter} />
      <AdminPostList
        items={filteredItem}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default AdminPosts;
