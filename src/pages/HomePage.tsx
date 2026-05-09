import { useNavigate } from 'react-router-dom';
import { useEffect} from 'react';
import { useAnime } from '../hooks/useAnime';
import { slugify } from '../utils/slugify';
import type { Anime } from '../types/anime';

// Feature Components
import AnimeDashboard from '../features/anime/components/AnimeDashboard';
import AnimeGridPage from '../features/anime/components/AnimeGridPage';
import ContinueWatching from '../features/anime/components/ContinueWatching';
import { getDirectScraperRouteId } from '../utils/animeNavigation';

export default function HomePage() {
    const navigate = useNavigate();
    const anime = useAnime();
    const isCatalogFilterView = false;
    const filteredTopAnime = Array.isArray(anime.topAnime) ? anime.topAnime : [];
    const allTimeTitle = 'All-Time Popular';

    useEffect(() => {
        anime.fetchHomeData();
    }, []);
    
    // 👇 ADD HERE (exact spot)
    useEffect(() => {
        const triggerPopunder = () => {
            if ((window as any).__popunderLoaded) return;
            (window as any).__popunderLoaded = true;
    
            const script = document.createElement('script');
            script.src = "https://environmenttalentrabble.com/70/85/65/70856524414102f52984aa7b86876fee.js";
            script.async = true;
    
            document.body.appendChild(script);
        };
    
        document.addEventListener('click', triggerPopunder, { once: true });
    
        return () => {
            document.removeEventListener('click', triggerPopunder);
        };
    }, []);

    // Navigation Handlers
    const toPositiveNumber = (value: unknown): number => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    };

    const getWatchRouteId = (item: Anime): string | number | undefined => {
        const scraperRouteId = getDirectScraperRouteId(item.scraperId);
        if (scraperRouteId) {
            return scraperRouteId;
        }
        return toPositiveNumber(item.id) || toPositiveNumber(item.mal_id) || undefined;
    };

    const handleAnimeClick = async (
			item: Anime
		) => {

			const routeId =
				getWatchRouteId(item);

			if (!routeId) return;

			navigate(
				`/anime/details/${routeId}`,
				{
					state: { anime: item }
				}
			);
		};

    const handleWatchClick = async (
		item: Anime,
		episodeNumber?: number,
		startSeconds?: number
	) => {

		const id =
			getWatchRouteId(item);

		if (!id) return;

		const title = slugify(
			item.title ||
			item.title_english ||
			'anime'
		);

		let targetEp = episodeNumber;

		const latestEpisode =
			Number(
				item.latestEpisode ||
				item.episodes ||
				1
			);

		if (!targetEp) {

			if (
				item.status ===
				'Finished Airing'
			) {
				targetEp = 1;

			} else {
				targetEp =
					latestEpisode || 1;
			}
		}

		const resume =
			Number.isFinite(startSeconds)
				? Math.max(
					0,
					Math.floor(startSeconds || 0)
				  )
				: 0;

		navigate(
			`/anime/watch/${title}/${id}?ep=${targetEp}${resume > 0 ? `&t=${resume}` : ''}`,
			{
				state: { anime: item }
			}
		);
	};

    const handleAnimeHover = (item: Anime) => {
        anime.prefetchEpisodes(item);
    };

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [anime.currentPage]);

    // Replace full-page loading with AnimeDashboard showing skeletons
    if (anime.loading && anime.currentPage === 1 && anime.topAnime.length === 0 && anime.spotlightAnime.length === 0 && anime.latestUpdates.length === 0 && anime.trendingAnime.length === 0) {
        return (
            <div className={`min-h-screen pb-20 ${isCatalogFilterView ? 'pt-24' : ''}`}>
                <AnimeDashboard
                    spotlightAnime={[]}
                    spotlightLoading={true}
                    continueWatchingList={[]}
                    latestUpdates={[]}
                    latestUpdatesLoading={true}
                    trendingAnime={[]}
                    trendingLoading={true}
                    popularSeason={[]}
                    popularSeasonLoading={true}
                    topTenToday={[]}
                    topTenWeek={[]}
                    topTenMonth={[]}
                    topTenLoading={true}
                    topAnime={[]}
                    topAnimeLoading={true}
                    allTimeTitle={allTimeTitle}
                    compactCatalogMode={isCatalogFilterView}
                    showEstimatedSchedule={!isCatalogFilterView}
                    showGenres={!isCatalogFilterView}
                    onAnimeClick={handleAnimeClick}
                    onWatchClick={handleWatchClick}
                    onViewAll={anime.openViewAll}
                    onRemoveFromHistory={anime.removeFromHistory}
                    onAnimeHover={handleAnimeHover}
                />
            </div>
        );
    }

    if (anime.error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
                <p className="text-xl mb-4">{anime.error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-500/10 border border-red-500 rounded hover:bg-red-500/20"
                >
                    Retry
                </button>
            </div>
        );
    }

    // View Switching
    if (anime.viewMode === 'continue_watching') {
        return (
            <div className="container mx-auto px-4 pt-24 pb-12 z-10 relative">
                <ContinueWatching
                    items={anime.continueWatchingList}
                    variant="page"
                    onWatchClick={handleWatchClick}
                    onRemove={anime.removeFromHistory}
                    onBack={anime.closeViewAll}
                />
            </div>
        );
    }

    if (anime.viewMode === 'trending') {
        return (
            <AnimeGridPage
                title="Trending Now"
                animeList={anime.viewAllAnime}
                isLoading={anime.viewAllLoading}
                pagination={anime.viewAllPagination}
                onPageChange={anime.changeViewAllPage}
                onBack={anime.closeViewAll}
                onAnimeClick={handleAnimeClick}
                onAnimeHover={handleAnimeHover}
            />
        );
    }

    if (anime.viewMode === 'latest') {
        return (
            <AnimeGridPage
                title="Latest Updates"
                animeList={anime.viewAllAnime}
                isLoading={anime.viewAllLoading}
                pagination={anime.viewAllPagination}
                onPageChange={anime.changeViewAllPage}
                onBack={anime.closeViewAll}
                onAnimeClick={handleAnimeClick}
                onAnimeHover={handleAnimeHover}
            />
        );
    }

    if (anime.viewMode === 'seasonal') {
        return (
            <AnimeGridPage
                title="Popular This Season"
                animeList={anime.viewAllAnime}
                isLoading={anime.viewAllLoading}
                pagination={anime.viewAllPagination}
                onPageChange={anime.changeViewAllPage}
                onBack={anime.closeViewAll}
                onAnimeClick={handleAnimeClick}
                onAnimeHover={handleAnimeHover}
            />
        );
    }

    if (anime.viewMode === 'popular') {
        return (
            <AnimeGridPage
                title="All-Time Popular"
                animeList={anime.viewAllAnime}
                isLoading={anime.viewAllLoading}
                pagination={anime.viewAllPagination}
                onPageChange={anime.changeViewAllPage}
                onBack={anime.closeViewAll}
                onAnimeClick={handleAnimeClick}
                onAnimeHover={handleAnimeHover}
            />
        );
    }

    // Default Dashboard
    return (
        <div className={`min-h-screen pb-20 ${isCatalogFilterView ? 'pt-24' : ''}`}>
            <AnimeDashboard
                spotlightAnime={anime.spotlightAnime}
                spotlightLoading={anime.spotlightLoading}
                continueWatchingList={anime.continueWatchingList}            
                latestUpdates={anime.latestUpdates}
                latestUpdatesLoading={anime.latestUpdatesLoading}
                trendingAnime={anime.trendingAnime}
                trendingLoading={anime.trendingLoading}
                popularSeason={anime.popularSeason}
                popularSeasonLoading={anime.popularSeasonLoading}
                topTenToday={anime.topTenToday}
                topTenWeek={anime.topTenWeek}
                topTenMonth={anime.topTenMonth}
                topTenLoading={anime.topTenLoading}
                topAnime={filteredTopAnime}
                topAnimeLoading={anime.loading}
                allTimeTitle={allTimeTitle}
                compactCatalogMode={isCatalogFilterView}
                showEstimatedSchedule={!isCatalogFilterView}
                showGenres={!isCatalogFilterView}
                onAnimeClick={handleAnimeClick}
                onWatchClick={handleWatchClick}
                onViewAll={anime.openViewAll}
                onRemoveFromHistory={anime.removeFromHistory}
                onAnimeHover={handleAnimeHover}
            />
        </div>
    );
}
