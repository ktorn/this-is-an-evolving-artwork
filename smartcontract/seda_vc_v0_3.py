

"""
A PoC contract to track versions of an evolving artwork.

v0.3
SEDA studio 2024
"""

import smartpy as sp

@sp.module
def main():
    class SEDAVersionControl(sp.Contract):
        def __init__(self, managers):
            self.data.managers = sp.cast(managers, sp.set[sp.address])
            self.data.versions = {}
            self.data.latest_version = ""
    
        @sp.entry_point()
        def add_version(self, version_number, ipfs_hash):
            assert self.data.managers.contains(sp.sender), "Only contract managers can add versions"
            assert version_number != "", "requires a valid version number"
            assert ipfs_hash != "", "requires an IPFS hash"
            assert not self.data.versions.contains(version_number), "version already exists"
    
            timestamp = sp.now
            
            self.data.versions[version_number] = sp.record(ipfs_hash=ipfs_hash, timestamp=timestamp)
            self.data.latest_version = version_number
        
        @sp.onchain_view()
        def get_version_hash(self, version_number):
            assert self.data.versions.contains(version_number), "version does not exist"
    
            return self.data.versions[version_number]
    
        @sp.onchain_view()
        def get_latest_version(self):
            # assert self.data.latest_version != "", "no versions added yet"
            latest_version_hash = self.data.versions[self.data.latest_version].ipfs_hash
    
            return latest_version_hash


# sp.add_compilation_target("test_deploy", SEDAVersionControl(
#     managers=sp.set([sp.address("tz1XJNUEYA8ZbEvBftSpR8aVEj9fXPXJy64o")])))


if "main" in __name__:
    @sp.add_test()
    def test():
    
        artist = sp.test_account("artist")
        non_artist = sp.test_account("non_artist")
        
        """Test:
        - Origination
        - Artist adds a version (1.0)
        - Someone retrieves the latest version
        - Artist adds another version (2.0)
        - Someone retrieves the latest version
        - Someone retrieves version 1.0
        """
        sc = sp.test_scenario("Basic scenario", main)
        sc.h1("Basic scenario.")

        sc.h2("Ghostnet Origination.")
        c_ghost = main.SEDAVersionControl(managers=sp.set([sp.address("tz1dd2tmTJFRJh8ycLuZeMpKLquJYkMypu2Q")]))
        sc += c_ghost
    
        sc.h2("Origination.")
        c1 = main.SEDAVersionControl(managers=sp.set([artist.address]))
    
        sc += c1
    
        sc.h2("Someone attempts to retrieve a version before one exists")
        c1.get_latest_version()
    
        sc.h2("Artist adds a version.")
        c1.add_version(version_number="1.0", ipfs_hash="Q11111111", _sender=artist)
    
        sc.h2("Someone retrieves the latest version.")
        sc.show(c1.get_latest_version())
        sc.verify(c1.get_latest_version() == "Q11111111")
    
        sc.h2("Artist adds another version (2.0)")
        c1.add_version(version_number="2.0", ipfs_hash="Q22222222", _sender=artist)
        
        sc.h2("Someone retrieves the latest version.")
        sc.show(c1.get_latest_version())
        sc.verify(c1.get_latest_version() == "Q22222222")
    
        sc.h2("Someone (non artist) tries to add a version")
        c1.add_version(version_number="3.0", ipfs_hash="Q33333333", _sender=non_artist, _valid=False)
    
        sc.h2("Artist tries to same version as existing (2.0)")
        c1.add_version(version_number="2.0", ipfs_hash="Q22222223", _sender=artist, _valid=False)
    
        sc.h2("Artist tries to empty version")
        c1.add_version(version_number="", ipfs_hash="Q22222223", _sender=artist, _valid=False)
    
        sc.h2("Artist tries to empty IPFS hash")
        c1.add_version(version_number="3.0", ipfs_hash="", _sender=artist, _valid=False)
