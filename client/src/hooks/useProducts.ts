import { useCallback, useEffect, useRef, useState } from "react";
import { getProducts, getProductBySlug, getFeaturedProducts, type ProductWithRelations } from "@/services/products";

const PAGE_LIMIT = 20;

export function useProducts(category?: string) {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchFirstPage = async () => {
      try {
        const result = await getProducts(1, PAGE_LIMIT, category);
        if (!cancelled) {
          setProducts(result.data);
          setTotal(result.total);
          setTotalPages(result.totalPages);
          setCurrentPage(1);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFirstPage();
    return () => { cancelled = true; };
  }, [category]);

  const loadMore = useCallback(async () => {
    if (loadingMore || currentPage >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await getProducts(nextPage, PAGE_LIMIT, category);
      if (mountedRef.current) {
        setProducts(prev => [...prev, ...result.data]);
        setCurrentPage(nextPage);
      }
    } catch (err: any) {
      if (mountedRef.current) setError(err.message || "Failed to load more products");
    } finally {
      if (mountedRef.current) setLoadingMore(false);
    }
  }, [loadingMore, currentPage, totalPages, category]);

  const hasMore = currentPage < totalPages;

  return { products, loading, loadingMore, error, total, hasMore, loadMore };
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
