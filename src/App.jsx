/* search functionality and pagination implemented at the bottom, to try filtered results popular domains such as github.com
are likely to have a match in the 500 fetched results, lazy loading is because of the 500 displayed results */



import { useEffect, useState } from "react";
import './App.css';

export default function App() {
  const [stories, setStories] = useState([]);
  const [displayedStories, setDisplayedStories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const storiesPerPage = 30;

  const getStories = async () => {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
    const data = await response.json();

    const stories = await Promise.all(data.map(async (id) => {
      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
      const storyData = await storyResponse.json();
      return storyData;
    }));

    setStories(stories);
    setDisplayedStories(stories.slice(0, storiesPerPage)); 
    setLoading(false); 
  };

  useEffect(() => {
    getStories();
  }, []);

  const handleTitleClick = (url) => {
    window.open(url, '_blank');
  };

  const extractDomain = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch (error) {
      return null;
    }
  };

  const handleFilter = (url) => {
    const domain = extractDomain(url);
    setFilterDomain(domain);
    setSearchTerm('');
    const filtered = stories.filter(story => story.url && extractDomain(story.url).includes(domain));
    setDisplayedStories(filtered.slice(0, storiesPerPage));
    setCurrentPage(1); 
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * storiesPerPage;
  
    let moreStories;
    if (filterDomain) {
      moreStories = stories.filter(story => story.url && extractDomain(story.url).includes(filterDomain));
      moreStories = moreStories.slice(startIndex, startIndex + storiesPerPage);
    } else if (searchTerm) {
      moreStories = stories.filter(story =>
        story.title.toLowerCase().includes(searchTerm)
      );
      moreStories = moreStories.slice(startIndex, startIndex + storiesPerPage);
    } else {
      moreStories = stories.slice(startIndex, startIndex + storiesPerPage);
    }
  
    setDisplayedStories(prevStories => [...prevStories, ...moreStories]);
    setCurrentPage(nextPage);
  };
  

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    setFilterDomain(''); 

    if (searchTerm) {
      const filtered = stories.filter(story =>
        story.title.toLowerCase().includes(searchTerm)
      );
      setDisplayedStories(filtered.slice(0, storiesPerPage));
      setCurrentPage(1); 
    } else {
      setDisplayedStories(stories.slice(0, storiesPerPage));
      setCurrentPage(1);
    }
  };

  const totalStories = filterDomain
    ? stories.filter(story => story.url && extractDomain(story.url).includes(filterDomain)).length
    : searchTerm
    ? stories.filter(story => story.title.toLowerCase().includes(searchTerm)).length
    : stories.length;

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <ul>
            <li><a onClick={()=>setDisplayedStories(stories)}>Hacker News</a></li>
            <li><a href="#">new</a></li>
            <li><a href="#">past</a></li>
            <li><a href="#">comments</a></li>
            <li><a href="#">ask</a></li>
            <li><a href="#">show</a></li>
            <li><a href="#">jobs</a></li>
            <li><a href="#">submit</a></li>
          </ul>
        </div>
        <ol className="stories">
          {displayedStories.map((story, index) => (
            <li key={story.id} className="story">
              <span className="index">{index + 1}.</span>
              <h2 onClick={() => handleTitleClick(story.url)}>{story.title}</h2>
              <a onClick={() => handleFilter(story.url)}>{extractDomain(story.url)}</a>
            </li>
          ))}
        </ol>
        {displayedStories.length < totalStories && (
          <button onClick={handleLoadMore}>Load More</button>
        )}
        <div className="search">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
    </div>
  );
}
