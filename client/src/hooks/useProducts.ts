import { useCallback, useEffect, useRef, useState } from "react";
import { getProducts, getProductBySlug, getFeaturedProducts, type ProductWithRelations } from "@/services/products";

export function useProducts() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchPage = useCallback(async (pageNum: number) => {
    const result = await getProducts(pageNum, 20);
    if (!mountedRef.current) return result;
    const items = Array.isArray(result) ? result : result.data ?? [];
    const pages = Array.isArray(result) ? 1 : result.totalPages ?? 1;
    if (pageNum === 1) {
      setProducts(items);
    } else {
      setProducts((prev) => [...prev, ...items]);
    }
    setTotalPages(pages);
    setPage(pageNum);
    return result;
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPage(1)
      .catch((err) => {
        if (mountedRef.current) setError(err.message || "Failed to load products");
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      await fetchPage(page + 1);
    } catch {
      // error already handled by fetchPage
    } finally {
      if (mountedRef.current) setLoadingMore(false);
    }
  }, [fetchPage, loadingMore, page, totalPages]);

  return { products, loading, loadingMore, error, loadMore, hasMore: page < totalPages };
}

export function useProduct(slug: string | null) {
  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProductBySlug(slug)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load product");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  return { product, loading, error };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getFeaturedProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load featured products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}
